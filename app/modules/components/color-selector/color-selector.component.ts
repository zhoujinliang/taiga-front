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

import {Component, OnInit, Input, forwardRef, Output, EventEmitter} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as Immutable from "immutable";
import * as _ from "lodash";
import {getDefaulColorList} from "../../../libs/utils";

const DEFAULT_COLOR = "#d3d7cf"

@Component({
    selector: "tg-color-selector",
    template: require("./color-selector.pug")(),
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ColorSelector),
        multi: true
      }
    ]
})
export class ColorSelector implements ControlValueAccessor, OnInit {
    @Input() initColor: string;
    @Input() isColorRequired: boolean;
    @Input() requiredPerm: string;
    @Input() project: Immutable.Map<string, any>;
    @Output() colorSelected: EventEmitter<string>;
    displayColorList: boolean = false;
    colorList: any[];
    customColor: string = "";
    _color: string = null;
    onChange: any;

    constructor() {
        this.colorList = getDefaulColorList();
        this.colorSelected = new EventEmitter();
    }

    ngOnInit() {
        if(this.isColorRequired) {
            this._color = this.initColor || DEFAULT_COLOR;
        }
    }

    writeValue(value: string) {
        if (value) {
            this.color = value;
        }
    }

    get color() {
        return this._color;
    }

    set color(val) {
        this._color = val;
        if (this.onChange) {
            this.onChange(val);
        }
        this.colorSelected.emit(val);
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched() {}

    userCanChangeColor() {
        if (!this.requiredPerm) { return true; }
        return this.project.get("my_permissions").indexOf(this.requiredPerm) !== -1;
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
            return this.color = this.initColor || DEFAULT_COLOR;
        }
    }

    toggleColorList() {
        this.displayColorList = !this.displayColorList;
        this.customColor = this.color;
        return this.resetColor();
    }

    onSelectDropdownColor(color) {
        this.color = color;
        return this.toggleColorList();
    }

    onKeyDown(event) {
        if (event.which === 13) { // ENTER
            // TODO: validate color format
            if (this.customColor || !this.isColorRequired) {
                this.color = this.customColor;
                return this.toggleColorList();
            }
            return event.preventDefault();
        }
    }
}
