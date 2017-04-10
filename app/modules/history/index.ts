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
 * File: history.module.coffee
 */

import * as angular from "angular"

import {CommentController} from "./comments/comment.controller"
import {CommentDirective} from "./comments/comment.directive"
import {CommentsController} from "./comments/comments.controller"
import {CommentsDirective} from "./comments/comments.directive"
import {HistorySectionController} from "./history.controller"
import {HistorySectionDirective} from "./history.directive"
import {ActivitiesDiffController} from "./history/history-diff.controller"
import {HistoryDiffDirective} from "./history/history-diff.directive"
import {HistoryDirective} from "./history/history.directive"
import {LightboxDisplayHistoricController} from "./history-lightbox/comment-history-lightbox.controller"
import {LightboxDisplayHistoricDirective} from "./history-lightbox/comment-history-lightbox.directive"
import {HistoryEntryDirective} from "./history-lightbox/history-entry.directive"
import {HistoryTabsDirective} from "./history-tabs/history-tabs.directive"

let module = angular.module("taigaHistory", []);
module.controller("CommentCtrl", CommentController);
module.directive("tgComment", CommentDirective);
module.controller("CommentsCtrl", CommentsController);
module.directive("tgComments", CommentsDirective);
module.controller("HistorySection", HistorySectionController);
module.directive("tgHistorySection", HistorySectionDirective);
module.controller("ActivitiesDiffCtrl", ActivitiesDiffController);
module.directive("tgHistoryDiff", HistoryDiffDirective);
module.directive("tgHistory", HistoryDirective);
module.controller("LightboxDisplayHistoricCtrl", LightboxDisplayHistoricController);
module.directive("tgLbDisplayHistoric", LightboxDisplayHistoricDirective);
module.directive("tgHistoryEntry", HistoryEntryDirective);
module.directive("tgHistoryTabs", HistoryTabsDirective);
