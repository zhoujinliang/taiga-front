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
 * File: navigation-bar.service.coffee
 */

import {Service} from "../../ts/classes"
import * as _ from "lodash"

export class NavigationBarService extends Service {
    enabledHeader:boolean

    constructor() {
        super()
        this.disableHeader();
    }

    enableHeader() {
        return this.enabledHeader = true;
    }

    disableHeader() {
        return this.enabledHeader = false;
    }

    isEnabledHeader():boolean {
        return this.enabledHeader;
    }
}
