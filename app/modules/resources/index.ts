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
 * File: resources.module.coffee
 */

import * as angular from "angular"

import {Resources} from "./resources"
import {AttachmentsResource} from "./attachments-resource.service"
import {EpicsResource} from "./epics-resource.service"
import {ExternalAppsResource} from "./external-apps-resource.service"
import {TrelloResource, JiraResource, GithubResource, AsanaResource} from "./importers-resource.service"
import {IssuesResource} from "./issues-resource.service"
import {ProjectsResource} from "./projects-resource.service"
import {StatsResource} from "./stats-resource.service"
import {TasksResource} from "./tasks-resource.service"
import {UserResource} from "./user-resource.service"
import {UsersResource} from "./users-resource.service"
import {UserstoriesResource} from "./userstories-resource.service"
import {WikiHistoryResource} from "./wiki-resource.service"

let module = angular.module("taigaResources2", []);
module.factory("tgAttachmentsResource", AttachmentsResource);
module.factory("tgEpicsResource", EpicsResource);
module.factory("tgExternalAppsResource", ExternalAppsResource);
module.factory("tgTrelloImportResource", TrelloResource);
module.factory("tgJiraImportResource", JiraResource);
module.factory("tgGithubImportResource", GithubResource);
module.factory("tgAsanaImportResource", AsanaResource);
module.factory("tgIssuesResource", IssuesResource);
module.factory("tgProjectsResources", ProjectsResource);
module.factory("tgStatsResource", StatsResource);
module.factory("tgTasksResource", TasksResource);
module.factory("tgUserResources", UserResource);
module.factory("tgUsersResources", UsersResource);
module.factory("tgUserstoriesResource", UserstoriesResource);
module.factory("tgWikiHistory", WikiHistoryResource);
module.service("tgResources", Resources);
