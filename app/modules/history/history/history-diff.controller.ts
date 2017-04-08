/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: history.controller.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaHistory");

class ActivitiesDiffController {
    type:any
    diffRemoveTags:any
    diffAddTags:any
    diff:any

    static initClass() {
        this.$inject = [
        ];
    }

    constructor() {}

    diffTags() {
        if (this.type === 'tags') {
            this.diffRemoveTags = _.difference(this.diff[0], this.diff[1]).toString();
            return this.diffAddTags = _.difference(this.diff[1], this.diff[0]).toString();
        }
    }
}
ActivitiesDiffController.initClass();


module.controller("ActivitiesDiffCtrl", ActivitiesDiffController);
