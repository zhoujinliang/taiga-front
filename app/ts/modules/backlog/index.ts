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
 * File: modules/backlog.coffee
 */

import * as angular from "angular"
import * as main from "./main"
import {CreateEditSprint} from "./lightboxes"
import {BacklogSortableDirective} from "./sortable"
import * as sprints from "./sprints"

let module = angular.module("taigaBacklog", []);
module.controller("BacklogController", main.BacklogController);
module.directive("tgBacklog", ["$tgRepo", "$rootScope", "$translate", "$tgResources", main.BacklogDirective]);
module.directive("tgUsRolePointsSelector", ["$rootScope", "$tgTemplate", "$compile", "$translate", main.UsRolePointsSelectorDirective]);
module.directive("tgBacklogUsPoints", ["$tgEstimationsService", "$tgRepo", "$tgTemplate", main.UsPointsDirective]);
module.directive("tgToggleBurndownVisibility", ["$tgStorage", main.ToggleBurndownVisibility]);
module.directive("tgBurndownBacklogGraph", ["$translate", main.BurndownBacklogGraphDirective]);
module.directive("tgBacklogProgressBar", ["$tgTemplate", "$compile", main.TgBacklogProgressBarDirective]);
module.directive("tgLbCreateEditSprint", ["$tgRepo", "$tgConfirm", "$tgResources", "$rootScope", "lightboxService", "$tgLoading", "$translate", CreateEditSprint]);
module.directive("tgBacklogSortable", BacklogSortableDirective);

module.directive("tgBacklogSprint", ["$tgRepo", "$rootScope", sprints.BacklogSprintDirective]);
module.directive("tgBacklogSprintHeader", ["$tgNavUrls", "$tgTemplate", "$compile", "$translate", sprints.BacklogSprintHeaderDirective]);
module.directive("tgBacklogToggleClosedSprintsVisualization", ["$rootScope", "$tgLoading", "$translate", sprints.ToggleExcludeClosedSprintsVisualization]);
