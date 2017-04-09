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
 * File: modules/admin.coffee
 */

import * as angular from "angular"

import * as lightboxes from "./lightboxes"
import * as memberships from "./memberships"
import {AdminNavigationDirective} from "./nav"
import * as projectProfile from "./project-profile"
import * as projectValues from "./project-values"
import * as roles from "./roles"
import * as thirdParties from "./third-parties"

let module = angular.module("taigaAdmin", []);
module.directive("tgLightboxAddMembersWarningMessage", [lightboxes.LightboxAddMembersWarningMessageDirective]);
module.directive('tgLbRequestOwnership', ["lightboxService", "tgResources", "$tgConfirm", "$translate", lightboxes.LbRequestOwnershipDirective]);
module.controller('ChangeOwnerLightbox', lightboxes.ChangeOwnerLightboxController);
module.directive("tgLbChangeOwner", ["lightboxService", "lightboxKeyboardNavigationService", "$tgTemplate", "$compile", lightboxes.ChangeOwnerLightboxDirective]);
module.directive("tgLbTransferProjectStartSuccess", ["lightboxService", lightboxes.TransferProjectStartSuccessDirective]);
module.controller("MembershipsController", memberships.MembershipsController);
module.directive("tgMemberships", ["$tgTemplate", "$compile", memberships.MembershipsDirective]);
module.directive("tgMembershipsRowAvatar", ["$log", "$tgTemplate", '$translate', "$compile", "tgAvatarService", memberships.MembershipsRowAvatarDirective]);
module.directive("tgMembershipsRowAdminCheckbox", ["$log", "$tgRepo", "$tgConfirm", "$tgTemplate",
                                                   "$compile", memberships.MembershipsRowAdminCheckboxDirective]);
module.directive("tgMembershipsRowRoleSelector", ["$log", "$tgRepo", "$tgConfirm",
                                                  memberships.MembershipsRowRoleSelectorDirective]);
module.directive("tgMembershipsRowActions", ["$log", "$tgRepo", "$tgResources", "$tgConfirm", "$compile",
                                             "$translate", "$tgLocation", "$tgNavUrls", "tgLightboxFactory",
                                             "tgProjectService", memberships.MembershipsRowActionsDirective]);
module.directive("tgNoMoreMembershipsExplanation", [memberships.NoMoreMembershipsExplanationDirective]);
module.directive("tgAdminNavigation", AdminNavigationDirective);
module.controller("ProjectProfileController", projectProfile.ProjectProfileController);
module.directive("tgProjectProfile", ["$tgRepo", "$tgConfirm", "$tgLoading", "$tgNavUrls", "$tgLocation",
                                      "tgProjectService", "tgCurrentUserService", projectProfile.ProjectProfileDirective]);
module.directive("tgProjectDefaultValues", ["$tgRepo", "$tgConfirm", "$tgLoading",
                                            projectProfile.ProjectDefaultValuesDirective]);
module.directive("tgProjectModules", ["$tgRepo", "$tgConfirm", "$tgLoading", "tgProjectService",
                                      projectProfile.ProjectModulesDirective]);
module.directive("tgProjectExport", ["$window", "$tgResources", "$tgConfirm", "$translate",
                                     projectProfile.ProjectExportDirective]);
module.controller("CsvExporterEpicsController", projectProfile.CsvExporterEpicsController);
module.controller("CsvExporterUserstoriesController", projectProfile.CsvExporterUserstoriesController);
module.controller("CsvExporterTasksController", projectProfile.CsvExporterTasksController);
module.controller("CsvExporterIssuesController", projectProfile.CsvExporterIssuesController);
module.directive("tgCsvEpic", ["$translate", projectProfile.CsvEpicDirective]);
module.directive("tgCsvUs", ["$translate", projectProfile.CsvUsDirective]);
module.directive("tgCsvTask", ["$translate", projectProfile.CsvTaskDirective]);
module.directive("tgCsvIssue", ["$translate", projectProfile.CsvIssueDirective]);
module.directive("tgProjectLogo", ["$tgAuth", "$tgModel", "$tgResources", "$tgConfirm", projectProfile.ProjectLogoDirective]);
module.directive('tgProjectLogoModel', ['$parse', projectProfile.ProjectLogoModelDirective]);
module.directive('tgAdminProjectRestrictions', [projectProfile.AdminProjectRestrictionsDirective]);
module.directive('tgAdminProjectRequestOwnership', ["tgLightboxFactory", projectProfile.AdminProjectRequestOwnershipDirective]);
module.directive('tgAdminProjectChangeOwner', ["tgLightboxFactory", projectProfile.AdminProjectChangeOwnerDirective]);
module.controller("ProjectValuesSectionController", projectValues.ProjectValuesSectionController);
module.controller("ProjectValuesController", projectValues.ProjectValuesController);
module.directive("tgProjectValues", ["$log", "$tgRepo", "$tgConfirm", "$tgLocation", "animationFrame",
                                     "$translate", "$rootScope", "tgProjectService", projectValues.ProjectValuesDirective]);
module.directive("tgColorSelection", projectValues.ColorSelectionDirective);
module.controller("ProjectCustomAttributesController", projectValues.ProjectCustomAttributesController);
module.directive("tgProjectCustomAttributes", ["$log", "$tgConfirm", "animationFrame", "$translate",
                                               projectValues.ProjectCustomAttributesDirective]);
module.controller("ProjectTagsController", projectValues.ProjectTagsController);
module.directive("tgProjectTags", ["$log", "$tgRepo", "$tgConfirm", "$tgLocation", "animationFrame",
                                   "$translate", "$rootScope", projectValues.ProjectTagsDirective]);
module.controller("RolesController", roles.RolesController);
module.directive("tgEditRole", ["$tgRepo", "$tgConfirm", roles.EditRoleDirective]);
module.directive("tgRoles", roles.RolesDirective);
module.directive("tgNewRole", ["$tgRepo", "$tgConfirm", roles.NewRoleDirective]);
module.directive("tgRolePermissions", ["$rootScope", "$tgRepo", "$tgConfirm", "$compile",
                                       roles.RolePermissionsDirective]);
module.controller("WebhooksController", thirdParties.WebhooksController);
module.directive("tgWebhook", ["$tgResources", "$tgRepo", "$tgConfirm", "$tgLoading", "$translate",
                               thirdParties.WebhookDirective]);
module.directive("tgNewWebhook", ["$tgResources", "$tgRepo", "$tgConfirm", "$tgLoading", thirdParties.NewWebhookDirective]);
module.controller("GithubController", thirdParties.GithubController);
module.controller("GitlabController", thirdParties.GitlabController);
module.controller("BitbucketController", thirdParties.BitbucketController);
module.directive("tgSelectInputText", thirdParties.SelectInputText);
module.directive("tgGithubWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", thirdParties.GithubWebhooksDirective]);
module.directive("tgGitlabWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", thirdParties.GitlabWebhooksDirective]);
module.directive("tgBitbucketWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", thirdParties.BitbucketWebhooksDirective]);
module.directive("tgValidOriginIps", thirdParties.ValidOriginIpsDirective);
module.controller("GogsController", thirdParties.GogsController);
