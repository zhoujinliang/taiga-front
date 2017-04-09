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
 * File: modules/wiki.coffee
 */

import * as angular from "angular"
import * as main from "./main"
import {WikiNavDirective} from "./nav"
import {WikiPagesListController} from "./pages-list"

let module = angular.module("taigaWiki", []);
module.controller("WikiDetailController", main.WikiDetailController);
module.directive("tgWikiSummary", ["$log", "$tgTemplate", "$compile", "$translate",  "tgAvatarService", main.WikiSummaryDirective]);
module.directive("tgWikiWysiwyg", ["$tgQueueModelTransformation", "$rootScope", "$tgConfirm", "tgAttachmentsFullService", "$tgQqueue",
                                   "$tgRepo", "$tgAnalytics", "tgWikiHistoryService", main.WikiWysiwyg]);
module.directive("tgWikiNav", ["$tgRepo", "$log", "$tgLocation", "$tgConfirm", "$tgAnalytics",
                               "$tgLoading", "$tgTemplate", "$compile", "$translate", WikiNavDirective]);
module.controller("WikiPagesListController", WikiPagesListController);
