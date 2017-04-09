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
 * File: watch-project-button.controller.coffee
 */

export class WatchProjectButtonController {
    confirm:any
    watchButtonService:any
    showWatchOptions:boolean
    loading:boolean
    project:any

    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "tgWatchProjectButtonService"
        ];
    }

    constructor(confirm, watchButtonService){
        this.confirm = confirm;
        this.watchButtonService = watchButtonService;
        this.showWatchOptions = false;
        this.loading = false;
    }

    toggleWatcherOptions() {
        return this.showWatchOptions = !this.showWatchOptions;
    }

    closeWatcherOptions() {
        return this.showWatchOptions = false;
    }

    watch(notifyLevel) {
        if (notifyLevel === this.project.get('notify_level')) { return; }

        this.loading = true;
        this.closeWatcherOptions();

        return this.watchButtonService.watch(this.project.get('id'), notifyLevel)
            .catch(() => this.confirm.notify("error"))
            .finally(() => this.loading = false);
    }

    unwatch() {
        this.loading = true;
        this.closeWatcherOptions();

        return this.watchButtonService.unwatch(this.project.get('id'))
            .catch(() => this.confirm.notify("error"))
            .finally(() => this.loading = false);
    }
}
WatchProjectButtonController.initClass();
