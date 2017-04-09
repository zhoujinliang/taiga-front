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
 * File: project.controller.coffee
 */

import {defineImmutableProperty} from "../../../ts/utils"

export class CreateProjectController {
    appMetaService:any
    translate:any
    projectService:any
    location:any
    authService:any
    displayScrumDesc:boolean
    displayKanbanDesc:boolean
    project:any

    static initClass() {
        this.$inject = [
            "tgAppMetaService",
            "$translate",
            "tgProjectService",
            "$location",
            "$tgAuth"
        ];
    }

    constructor(appMetaService, translate, projectService, location, authService) {
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        this.location = location;
        this.authService = authService;
        defineImmutableProperty(this, "project", () => { return this.projectService.project; });

        this.appMetaService.setfn(this._setMeta.bind(this));

        this.authService.refresh();

        this.displayScrumDesc = false;
        this.displayKanbanDesc = false;
    }

    _setMeta() {
        if (!this.project) { return null; }

        let ctx = {projectName: this.project.get("name")};

        return {
            title: this.translate.instant("PROJECT.PAGE_TITLE", ctx),
            description: this.project.get("description")
        };
    }

    displayHelp(type, $event) {
        $event.stopPropagation();
        $event.preventDefault();

        if (type === 'scrum') {
            this.displayScrumDesc = !this.displayScrumDesc;
        }
        if (type === 'kanban') {
            return this.displayKanbanDesc = !this.displayKanbanDesc;
        }
    }
}
CreateProjectController.initClass();
