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
 * File: wiki-history.module.coffee
 */

import * as angular from "angular"

import {CreateEpicController} from "./create-epic/create-epic.controller"
import {CreateEpicDirective} from "./create-epic/create-epic.directive"
import {EpicRowController} from "./dashboard/epic-row/epic-row.controller"
import {EpicRowDirective} from "./dashboard/epic-row/epic-row.directive"
import {EpicsDashboardController} from "./dashboard/epics-dashboard.controller"
import {EpicsSortableDirective} from "./dashboard/epics-sortable/epics-sortable.directive"
import {EpicsTableController} from "./dashboard/epics-table/epics-table.controller"
import {EpicsTableDirective} from "./dashboard/epics-table/epics-table.directive"
import {StoryRowController} from "./dashboard/story-row/story-row.controller"
import {StoryRowDirective} from "./dashboard/story-row/story-row.directive"
import {EpicsService} from "./epics.service"
import {RelatedUserStoriesController} from "./related-userstories/related-userstories-controller"
import {RelatedUserstoriesCreateController} from "./related-userstories/related-userstories-create/related-userstories-create.controller"
import {RelatedUserstoriesCreateDirective} from "./related-userstories/related-userstories-create/related-userstories-create.directive"
import {RelatedUserStoriesDirective} from "./related-userstories/related-userstories.directive"
import {RelatedUserstoriesSortableDirective} from "./related-userstories/related-userstories-sortable/related-userstories-sortable.directive"
import {RelatedUserstoryRowController} from "./related-userstories/related-userstory-row/related-userstory-row.controller"
import {RelatedUserstoryRowDirective} from "./related-userstories/related-userstory-row/related-userstory-row.directive"

export let module = angular.module("taigaEpics", []);
module.controller("CreateEpicCtrl", CreateEpicController);
module.directive("tgCreateEpic", CreateEpicDirective);
module.controller("EpicRowCtrl", EpicRowController);
module.directive("tgEpicRow", EpicRowDirective);
module.controller("EpicsDashboardCtrl", EpicsDashboardController);
module.directive("tgEpicsSortable", EpicsSortableDirective);
module.controller("EpicsTableCtrl", EpicsTableController);
module.directive("tgEpicsTable", EpicsTableDirective);
module.controller("StoryRowCtrl", StoryRowController);
module.directive("tgStoryRow", StoryRowDirective);
module.service('tgEpicsService', EpicsService);
module.controller("RelatedUserStoriesCtrl", RelatedUserStoriesController);
module.controller("RelatedUserstoriesCreateCtrl", RelatedUserstoriesCreateController);
module.directive("tgRelatedUserstoriesCreate", RelatedUserstoriesCreateDirective);
module.directive("tgRelatedUserstories", RelatedUserStoriesDirective);
module.directive("tgRelatedUserstoriesSortable", RelatedUserstoriesSortableDirective);
module.controller("RelatedUserstoryRowCtrl", RelatedUserstoryRowController);
module.directive("tgRelatedUserstoryRow", RelatedUserstoryRowDirective);
