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
 * File: modules/common/analytics.coffee
 */

import {Service} from "../../../ts/classes"
import * as _ from "lodash"

export class AnalyticsService extends Service {
    rootscope:any
    log:any
    config:any
    win:any
    doc:any
    location:any
    conf:any
    accountId:any
    pageEvent:any
    trackRoutes:any
    ignoreFirstPageLoad:any
    initialized:boolean

    static initClass() {
        this.$inject = ["$rootScope", "$log", "$tgConfig", "$window", "$document", "$location"];
    }

    constructor(rootscope, log, config, win, doc, location) {
        super();
        this.rootscope = rootscope;
        this.log = log;
        this.config = config;
        this.win = win;
        this.doc = doc;
        this.location = location;
        this.initialized = false;

        let conf = this.config.get("analytics", {});

        this.accountId = conf.accountId;
        this.pageEvent = conf.pageEvent || "$routeChangeSuccess";
        this.trackRoutes = conf.trackRoutes || true;
        this.ignoreFirstPageLoad = conf.ignoreFirstPageLoad || false;
    }

    initialize() {
        if (!this.accountId) {
            this.log.debug("Analytics: no acount id provided. Disabling.");
            return;
        }

        this.injectAnalytics();

        this.win.ga("create", this.accountId, "auto");
        this.win.ga("require", "displayfeatures");

        if (this.trackRoutes && (!this.ignoreFirstPageLoad)) {
            this.win.ga("send", "pageview", this.getUrl());
        }

        // activates page tracking
        if (this.trackRoutes) {
            this.rootscope.$on(this.pageEvent, () => {
                return this.trackPage(this.getUrl(), "Taiga");
            });
        }

        return this.initialized = true;
    }

    getUrl() {
        return this.location.path();
    }

    injectAnalytics() {
        var gaNewElem : any = {};
        var gaElems : any = {};
        var currdate : any = new Date();

        let fn = (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*currdate;a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);});
        return fn(window, document, "script", "//www.google-analytics.com/analytics.js", "ga", gaNewElem, gaElems);
    }

    trackPage(url, title) {
        if (!this.initialized) { return; }
        if (!this.win.ga) { return; }

        title = title || this.doc[0].title;
        return this.win.ga("send", "pageview", {
            "page": url,
            "title": title
        });
    }

    trackEvent(category, action, label, value) {
        if (!this.initialized) { return; }
        if (!this.win.ga) { return; }

        return this.win.ga("send", "event", category, action, label, value);
    }
}
