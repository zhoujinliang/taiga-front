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
 * File: watch-button.controller.coffee
 */

import * as angular from "angular"

class WatchButtonController {
    rootScope: angular.IScope
    currentUserService:any
    user:any
    isMouseOver:boolean
    loading:boolean
    item:any
    onWatch:any
    onUnwatch:any

    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "$rootScope"
        ];
    }

    constructor(currentUserService, rootScope) {
        this.currentUserService = currentUserService;
        this.rootScope = rootScope;
        this.user = this.currentUserService.getUser();
        this.isMouseOver = false;
        this.loading = false;
    }

    showTextWhenMouseIsOver() {
        return this.isMouseOver = true;
    }

    showTextWhenMouseIsLeave() {
        return this.isMouseOver = false;
    }

    openWatchers() {
        return this.rootScope.$broadcast("watcher:add", this.item);
    }

    getPerms() {
        if (!this.item) { return ""; }

        let name = this.item._name;

        let perms = {
            userstories: 'modify_us',
            issues: 'modify_issue',
            tasks: 'modify_task',
            epics: 'modify_epic'
        };

        return perms[name];
    }

    toggleWatch() {
        let promise;
        this.loading = true;

        if (!this.item.is_watcher) {
            promise = this._watch();
        } else {
            promise = this._unwatch();
        }

        promise.finally(() => this.loading = false);

        return promise;
    }

    _watch() {
        return this.onWatch().then(() => {
            return this.showTextWhenMouseIsLeave();
        });
    }

    _unwatch() {
        return this.onUnwatch();
    }
}
WatchButtonController.initClass();

angular.module("taigaComponents").controller("WatchButton", WatchButtonController);
