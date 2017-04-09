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
 * File: modules/issues.coffee
 */
import * as angular from "angular"
import * as list from "./list"
import * as detail from "./detail"
import * as lightboxes from "./lightboxes"

let module = angular.module("taigaIssues", []);

module.controller("IssuesController", list.IssuesController);
module.directive("tgIssues", ["$log", "$tgLocation", "$tgTemplate", "$compile", list.IssuesDirective]);
module.directive("tgIssueStatusInlineEdition", ["$tgRepo", "$tgTemplate", "$rootScope", list.IssueStatusInlineEditionDirective]);
module.directive("tgIssueAssignedToInlineEdition", ["$tgRepo", "$rootScope", "$translate", "tgAvatarService", list.IssueAssignedToInlineEditionDirective]);

module.controller("IssueDetailController", detail.IssueDetailController);
module.directive("tgIssueStatusDisplay", ["$tgTemplate", "$compile", detail.IssueStatusDisplayDirective]);
module.directive("tgIssueStatusButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", detail.IssueStatusButtonDirective]);
module.directive("tgIssueTypeButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", detail.IssueTypeButtonDirective]);
module.directive("tgIssueSeverityButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", detail.IssueSeverityButtonDirective]);
module.directive("tgIssuePriorityButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", detail.IssuePriorityButtonDirective]);
module.directive("tgPromoteIssueToUsButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$translate", detail.PromoteIssueToUsButtonDirective]);

module.directive("tgLbCreateIssue", ["$tgRepo", "$tgConfirm", "$rootScope", "lightboxService", "$tgLoading",
                                     "$q", "tgAttachmentsService", lightboxes.CreateIssueDirective]);
module.directive("tgLbCreateBulkIssues", ["$tgRepo", "$tgResources", "$tgConfirm", "$rootScope", "$tgLoading",
                                          "lightboxService", lightboxes.CreateBulkIssuesDirective]);
