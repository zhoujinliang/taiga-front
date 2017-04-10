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

import {WikiHistoryController} from "./wiki-history.controller"
import {WikiHistoryDiffDirective} from "./wiki-history-diff.directive"
import {WikiHistoryDirective} from "./wiki-history.directive"
import {WikiHistoryEntryDirective} from "./wiki-history-entry.directive"
import {WikiHistoryService} from "./wiki-history.service"

let module = angular.module("taigaWikiHistory", []);
module.controller("WikiHistoryCtrl", WikiHistoryController);
module.directive("tgWikiHistoryDiff", WikiHistoryDiffDirective);
module.directive("tgWikiHistory", WikiHistoryDirective);
module.directive("tgWikiHistoryEntry", WikiHistoryEntryDirective);
module.service("tgWikiHistoryService", WikiHistoryService);
