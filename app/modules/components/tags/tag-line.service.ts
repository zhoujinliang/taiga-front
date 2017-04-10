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
 * File: tag-line.service.coffee
 */

import {Service} from "../../../ts/classes"
import * as angular from "angular"
import * as _ from "lodash"

export class TagLineService extends Service {
    static initClass() {
        this.$inject = [];
    }

    constructor() {
        super()
    }

    checkPermissions(myPermissions, projectPermissions) {
        return _.includes(myPermissions, projectPermissions);
    }

    createColorsArray(projectTagColors) {
        return _.map(projectTagColors, (index, value) => [value, index]);
    }
}
TagLineService.initClass();

