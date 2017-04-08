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
 * File: color-selector.controller.coffee
 */

import {getDefaulColorList} from "../../../ts/utils"
import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

class ColorSelectorController {
    projectService:any
    colorList:any
    displayColorList:any
    requiredPerm:any
    isColorRequired:any
    color:any
    customColor:any
    initColor:any
    onSelectColor:any

    static initClass() {
        this.$inject = [
            "tgProjectService",
        ];
    }

    constructor(projectService) {
        this.projectService = projectService;
        this.colorList = getDefaulColorList();
        this.checkIsColorRequired();
        this.displayColorList = false;
    }

    userCanChangeColor() {
        if (!this.requiredPerm) { return true; }
        return this.projectService.hasPermission(this.requiredPerm);
    }

    checkIsColorRequired() {
        if (!this.isColorRequired) {
            return this.colorList = _.dropRight(this.colorList);
        }
    }

    setColor(color) {
        this.color = color;
        return this.customColor = color;
    }

    resetColor() {
        if (this.isColorRequired && !this.color) {
            return this.color = this.initColor;
        }
    }

    toggleColorList() {
        this.displayColorList = !this.displayColorList;
        this.customColor = this.color;
        return this.resetColor();
    }

    onSelectDropdownColor(color) {
        this.color = color;
        this.onSelectColor({color});
        return this.toggleColorList();
    }

    onKeyDown(event) {
        if (event.which === 13) { // ENTER
            if (this.customColor || !this.isColorRequired) {
                this.onSelectDropdownColor(this.customColor);
            }
            return event.preventDefault();
        }
    }
}
ColorSelectorController.initClass();


angular.module('taigaComponents').controller("ColorSelectorCtrl", ColorSelectorController);
