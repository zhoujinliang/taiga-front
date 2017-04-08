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
 * File: create-epic.controller.coffee
 */

import {getRandomDefaultColor, trim} from "../../../ts/utils"
import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

class CreateEpicController {
    confirm:any
    projectService:any
    epicsService:any
    project:any
    loading:boolean
    newEpic:any
    attachments:Immutable.List<any>
    validateForm:any
    onCreateEpic:any
    setFormErrors:any

    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "tgProjectService",
            "tgEpicsService"
        ];
    }

    constructor(confirm, projectService, epicsService) {
        // NOTE: To use Checksley setFormErrors() and validateForm()
        //       are defined in the directive.

        // NOTE: We use project as no inmutable object to make
        //       the code compatible with the old code
        this.confirm = confirm;
        this.projectService = projectService;
        this.epicsService = epicsService;
        this.project = this.projectService.project.toJS();

        this.newEpic = {
            color: getRandomDefaultColor(),
            status: this.project.default_epic_status,
            tags: []
        };
        this.attachments = Immutable.List();

        this.loading = false;
    }

    createEpic() {
        if (!this.validateForm()) { return; }

        this.loading = true;

        return this.epicsService.createEpic(this.newEpic, this.attachments)
            .then(response => { // On success
                this.onCreateEpic();
                return this.loading = false;
        }).catch(response => { // On error
                this.loading = false;
                this.setFormErrors(response.data);
                if (response.data._error_message) {
                    return this.confirm.notify("error", response.data._error_message);
                }
        });
    }

    // Color selector
    selectColor(color) {
        return this.newEpic.color = color;
    }

    // Tags
    addTag(name, color) {
        name = trim(name.toLowerCase());

        if (!_.find(this.newEpic.tags, it => it[0] === name)) {
            return this.newEpic.tags.push([name, color]);
        }
    }

    deleteTag(tag) {
        return _.remove(this.newEpic.tags, it => it[0] === tag[0]);
    }

    // Attachments
    addAttachment(attachment) {
        return this.attachments.push(attachment);
    }
}
CreateEpicController.initClass();

angular.module("taigaEpics").controller("CreateEpicCtrl", CreateEpicController);
