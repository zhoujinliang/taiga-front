/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
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
 * File: user-activity.service.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

export class UserActivityService {
    timeout: any
    idleTimeout: any
    subscriptionsActive: any
    subscriptionsInactive: any
    isActive: any
    timerId: any

    static initClass() {
        this.$inject = ['$timeout'];
        this.prototype.idleTimeout = 60 * 5 * 1000;
    }

    constructor(timeout) {
        this.timeout = timeout;
        if (window.localStorage.e2e) { return null; }

        window.addEventListener('mousemove', this.resetTimer.bind(this), false);
        window.addEventListener('mousedown', this.resetTimer.bind(this), false);
        window.addEventListener('keypress', this.resetTimer.bind(this), false);
        window.addEventListener('mousewheel', this.resetTimer.bind(this), false);
        window.addEventListener('touchmove', this.resetTimer.bind(this), false);

        this.subscriptionsActive = [];
        this.subscriptionsInactive = [];
        this.isActive = true;

        this.startTimer();
    }

    startTimer() {
        return this.timerId = this.timeout(this._fireInactive.bind(this), this.idleTimeout);
    }

    resetTimer() {
        if (!this.isActive) {
            this._fireActive();
        }

        this.timeout.cancel(this.timerId);
        this.startTimer();

        return this.isActive = true;
    }

    onActive(cb) {
        this.subscriptionsActive.push(cb);

        return this._unSubscriptionsActive.bind(this, cb);
    }

    onInactive(cb) {
        this.subscriptionsInactive.push(cb);

        return this._unSubscriptionsInactive.bind(this, cb);
    }

    _fireActive() {
        return this.subscriptionsActive.forEach(it => it());
    }

    _fireInactive() {
        this.isActive = false;
        return this.subscriptionsInactive.forEach(it => it());
    }

    _unSubscriptionsActive(cb) {
        return this.subscriptionsActive = this.subscriptionsActive.filter(fn => fn !== cb);
    }

    _unSubscriptionsInactive(cb) {
        return this.subscriptionsInactive = this.subscriptionsInactive.filter(fn => fn !== cb);
    }
}
UserActivityService.initClass();
