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
 * File: modules/profile/profile-timeline/profile-timeline.controller.coffee
 */

import {mixOf} from "../../../ts/utils"
import {Controller} from "../../../ts/classes"
import {PageMixin, FiltersMixin} from "../../../ts/modules/controllerMixins"
import * as angular from "angular"
import * as Immutable from "immutable"

class UserTimelineController extends mixOf(Controller, PageMixin, FiltersMixin) {
    userTimelineService:any
    timelineList:any
    scrollDisabled:any
    timeline:any
    projectId:any
    currentUser:any
    user:any

    static initClass() {
        this.$inject = [
            "tgUserTimelineService"
        ];
    }

    constructor(userTimelineService) {
        super()
        this.userTimelineService = userTimelineService;
        this.timelineList = Immutable.List();
        this.scrollDisabled = false;

        this.timeline = null;

        if (this.projectId) {
            this.timeline = this.userTimelineService.getProjectTimeline(this.projectId);
        } else if (this.currentUser) {
            this.timeline = this.userTimelineService.getProfileTimeline(this.user.get("id"));
        } else {
            this.timeline = this.userTimelineService.getUserTimeline(this.user.get("id"));
        }
    }

    loadTimeline() {
        this.scrollDisabled = true;

        return this.timeline
            .next()
            .then(response => {
                this.timelineList = this.timelineList.concat(response.get("items"));

                if (response.get("next")) {
                    this.scrollDisabled = false;
                }

                return this.timelineList;
        });
    }
}
UserTimelineController.initClass();

angular.module("taigaUserTimeline")
    .controller("UserTimeline", UserTimelineController);
