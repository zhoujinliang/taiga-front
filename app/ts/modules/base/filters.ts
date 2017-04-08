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
 * File: modules/base/filters.coffee
 */


import {Service} from "../../../ts/classes"
import {hex_sha1} from "../../../ts/global"
import * as _ from "lodash"
import * as angular from "angular"

class FiltersStorageService extends Service {
    storage:any
    params:any

    static initClass() {
        this.$inject = ["$tgStorage", "$routeParams"];
    }

    constructor(storage, params) {
        super()
        this.storage = storage;
        this.params = params;
    }

    generateHash(components) {
        if (components == null) { components = []; }
        components = _.map(components, x => JSON.stringify(x));
        return hex_sha1(components.join(":"));
    }
}
FiltersStorageService.initClass();
