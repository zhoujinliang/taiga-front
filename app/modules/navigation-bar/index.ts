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
 * File: navigation-bar.module.coffee
 */

import * as angular from "angular"

import {DropdownProjectListDirective} from "./dropdown-project-list/dropdown-project-list.directive"
import {DropdownUserDirective} from "./dropdown-user/dropdown-user.directive"
import {NavigationBarDirective} from "./navigation-bar.directive"
import {NavigationBarService} from "./navigation-bar.service"

let module = angular.module("taigaNavigationBar", []);
module.directive("tgDropdownProjectList", DropdownProjectListDirective);
module.directive("tgDropdownUser", DropdownUserDirective);
module.directive("tgNavigationBar", NavigationBarDirective);
module.service("tgNavigationBarService", NavigationBarService);
