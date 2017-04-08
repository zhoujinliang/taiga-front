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
 * File: assigned-to-selector.controller.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

class AssignedToSelectorController {
    project:any
    assigned:any
    assignedMember:any
    nonAssignedMembers:any

    static initClass() {
        this.$inject = [];
    }

    constructor() {
        if (this.assigned) {
            this._getAssignedMember();
        }
        this._filterAssignedMember();
    }

    _getAssignedMember() {
        return this.assignedMember = _.filter(this.project.members, (member:any) => {
            return member.id === this.assigned.get('id');
        });
    }

    _filterAssignedMember() {
        if (this.assigned) {
            return this.nonAssignedMembers = _.filter(this.project.members, (member:any) => {
                return member.id !== this.assigned.get('id');
            });
        } else {
            return this.nonAssignedMembers = this.project.members;
        }
    }
}
AssignedToSelectorController.initClass();

angular.module('taigaComponents').controller('AssignedToSelectorCtrl', AssignedToSelectorController);
