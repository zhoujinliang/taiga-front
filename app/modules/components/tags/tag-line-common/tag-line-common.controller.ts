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
 * File: tag-line.controller.coffee
 */

import {trim} from "../../../../ts/utils"
import * as angular from "angular"

export class TagLineCommonController {
    tagLineService:any
    disableColorSelection:any
    newTag:any
    colorArray:any
    addTag:any
    project:any
    permissions:any
    onAddTag:any

    static initClass() {
        this.$inject = [
            "tgTagLineService"
        ];
    }

    constructor(tagLineService) {
        this.tagLineService = tagLineService;
        this.disableColorSelection = false;
        this.newTag = {name: "", color: null};
        this.colorArray = [];
        this.addTag = false;
    }

    checkPermissions() {
        return this.tagLineService.checkPermissions(this.project.my_permissions, this.permissions);
    }

    _createColorsArray(projectTagColors) {
        return this.colorArray =  this.tagLineService.createColorsArray(projectTagColors);
    }

    displayTagInput() {
        return this.addTag = true;
    }

    addNewTag(name, color) {
        this.newTag.name = "";
        this.newTag.color = null;

        if (!name.length) { return; }

        if (this.disableColorSelection) {
            if (name.length) { return this.onAddTag({name, color}); }
        } else {
            if (this.project.tags_colors[name]) {
                color = this.project.tags_colors[name];
            }
            return this.onAddTag({name, color});
        }
    }

    selectColor(color) {
        return this.newTag.color = color;
    }
}
TagLineCommonController.initClass();

