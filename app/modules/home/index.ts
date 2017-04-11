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
 * File: home.module.coffee
 */

import * as angular from "angular"
import {HomeController} from "./home.controller"
import {HomeService} from "./home.service"
import {DutyDirective} from "./duties/duty.directive"
import {HomeProjectListDirective} from "./projects/home-project-list.directive"
import {WorkingOnController} from "./working-on/working-on.controller"
import {WorkingOnDirective} from "./working-on/working-on.directive"

let module = angular.module("taigaHome", []);
module.controller("Home", HomeController);
module.service("tgHomeService", HomeService);
module.directive("tgDuty", DutyDirective);
module.directive("tgHomeProjectList", HomeProjectListDirective);
module.controller("WorkingOn", WorkingOnController);
module.directive("tgWorkingOn", WorkingOnDirective);
