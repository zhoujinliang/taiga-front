/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: modules/events.coffee
 */

import {startswith, bindMethods} from "../utils"
import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaEvents", []);


class EventsService {
    win:any
    log:any
    config:any
    auth:any
    liveAnnouncementService:any
    rootScope: angular.IScope
    sessionId:any
    subscriptions:any
    connected:any
    error:any
    pendingMessages:any
    missedHeartbeats:any
    heartbeatInterval:any
    ws:any
    reconnectTryInterval:any

    constructor(win, log, config, auth, liveAnnouncementService, rootScope) {
        this.processMessage = this.processMessage.bind(this);
        this.win = win;
        this.log = log;
        this.config = config;
        this.auth = auth;
        this.liveAnnouncementService = liveAnnouncementService;
        this.rootScope = rootScope;
        bindMethods(this);
    }

    initialize(sessionId) {
        this.sessionId = sessionId;
        this.subscriptions = {};
        this.connected = false;
        this.error = false;
        this.pendingMessages = [];

        this.missedHeartbeats = 0;
        this.heartbeatInterval = null;

        if (this.win.WebSocket === undefined) {
            return this.log.info("WebSockets not supported on your browser");
        }
    }

    setupConnection() {
        this.stopExistingConnection();

        let url = this.config.get("eventsUrl");

        // This allows disable events in case
        // url is not found on the configuration.
        if (!url) { return; }

        // This allows relative urls in configuration.
        if (!startswith(url, "ws:") && !startswith(url, "wss:")) {
            let loc = this.win.location;
            let scheme = loc.protocol === "https:" ? "wss:" : "ws:";
            let path = _.trimStart(url, "/");
            url = `${scheme}//${loc.host}/${path}`;
        }

        this.error = false;
        this.ws = new this.win.WebSocket(url);
        this.ws.addEventListener("open", this.onOpen);
        this.ws.addEventListener("message", this.onMessage);
        this.ws.addEventListener("error", this.onError);
        return this.ws.addEventListener("close", this.onClose);
    }

    stopExistingConnection() {
        if (this.ws === undefined) {
            return;
        }

        this.ws.removeEventListener("open", this.onOpen);
        this.ws.removeEventListener("close", this.onClose);
        this.ws.removeEventListener("error", this.onError);
        this.ws.removeEventListener("message", this.onMessage);
        this.stopHeartBeatMessages();
        this.ws.close();

        return delete this.ws;
    }

    notifications() {
        return this.subscribe(null, 'notifications', data => {
            this.liveAnnouncementService.show(data.title, data.desc);
            return this.rootScope.$digest();
        });
    }

    //##########################################
    // Heartbeat (Ping - Pong)
    //##########################################
    // See  RFC https://tools.ietf.org/html/rfc6455#section-5.5.2
    //      RFC https://tools.ietf.org/html/rfc6455#section-5.5.3
    startHeartBeatMessages() {
        if (this.heartbeatInterval) { return; }

        let maxMissedHeartbeats =  this.config.get("eventsMaxMissedHeartbeats", 5);
        let heartbeatIntervalTime = this.config.get("eventsHeartbeatIntervalTime", 60000);
        let reconnectTryInterval = this.config.get("eventsReconnectTryInterval", 10000);

        this.missedHeartbeats = 0;
        this.heartbeatInterval = setInterval(() => {
            try {
                if (this.missedHeartbeats >= maxMissedHeartbeats) {
                    throw new Error("Too many missed heartbeats PINGs.");
                }

                this.missedHeartbeats++;
                this.sendMessage({cmd: "ping"});
                return this.log.debug("HeartBeat send PING");
            } catch (e) {
                this.log.error(`HeartBeat error: ${e.message}`);
                return this.setupConnection();
            }
        }
        , heartbeatIntervalTime);

        return this.log.debug("HeartBeat enabled");
    }

    stopHeartBeatMessages() {
        if (!this.heartbeatInterval) { return; }

        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;

        return this.log.debug("HeartBeat disabled");
    }

    processHeartBeatPongMessage(data) {
        this.missedHeartbeats = 0;
        return this.log.debug("HeartBeat recived PONG");
    }

    //##########################################
    // Messages
    //##########################################
    serialize(message) {
        if (_.isObject(message)) {
            return JSON.stringify(message);
        }
        return message;
    }

    sendMessage(message) {
        this.pendingMessages.push(message);

        if (!this.connected) {
            return;
        }

        let messages = _.map(this.pendingMessages, this.serialize);
        this.pendingMessages = [];

        return Array.from(messages).map((msg) =>
            this.ws.send(msg));
    }

    processMessage(data) {
        let routingKey = data.routing_key;

        if ((this.subscriptions[routingKey] == null)) {
            return;
        }

        let subscription = this.subscriptions[routingKey];

        if (subscription.scope) {
            return subscription.scope.$apply(() => subscription.callback(data.data));

        } else {
            return subscription.callback(data.data);
        }
    }

    //##########################################
    // Subscribe and Unsubscribe
    //##########################################
    subscribe(scope, routingKey, callback) {
        if (this.error) {
            return;
        }

        this.log.debug(`Subscribe to: ${routingKey}`);
        let subscription = {
            scope,
            routingKey,
            callback: _.debounce(callback, 500, {"leading": true, "trailing": false})
        };

        let message = {
            "cmd": "subscribe",
            "routing_key": routingKey
        };

        this.subscriptions[routingKey] = subscription;
        this.sendMessage(message);

        if (scope) { return scope.$on("$destroy", () => this.unsubscribe(routingKey)); }
    }

    unsubscribe(routingKey) {
        if (this.error) {
            return;
        }

        this.log.debug(`Unsubscribe from: ${routingKey}`);

        let message = {
            "cmd": "unsubscribe",
            "routing_key": routingKey
        };

        return this.sendMessage(message);
    }

    //##########################################
    // Event listeners
    //##########################################
    onOpen() {
        this.connected = true;
        this.startHeartBeatMessages();

        this.log.debug("WebSocket connection opened");
        let token = this.auth.getToken();

        let message = {
            cmd: "auth",
            data: {token, sessionId: this.sessionId}
        };

        this.sendMessage(message);
        return this.notifications();
    }

    onMessage(event) {
        this.log.debug(`WebSocket message received: ${event.data}`);

        let data = JSON.parse(event.data);

        if (data.cmd === "pong") {
            return this.processHeartBeatPongMessage(data);
        } else {
            return this.processMessage(data);
        }
    }

    onError(error) {
        this.log.error(`WebSocket error: ${error}`);
        this.error = true;
        return setTimeout(this.setupConnection, this.reconnectTryInterval);
    }

    onClose() {
        this.log.debug("WebSocket closed.");
        this.connected = false;
        this.stopHeartBeatMessages();
        return setTimeout(this.setupConnection, this.reconnectTryInterval);
    }
}


class EventsProvider {
    sessionId:any

    static initClass() {
        this.prototype.$get.$inject = [
            "$window",
            "$log",
            "$tgConfig",
            "$tgAuth",
            "tgLiveAnnouncementService",
            "$rootScope"
        ];
    }
    setSessionId(sessionId) {
        return this.sessionId = sessionId;
    }

    $get($win, $log, $conf, $auth, liveAnnouncementService, $rootScope) {
        let service = new EventsService($win, $log, $conf, $auth, liveAnnouncementService, $rootScope);
        service.initialize(this.sessionId);
        return service;
    }
}
EventsProvider.initClass();

module.provider("$tgEvents", EventsProvider);
