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
 * File: modules/admin/lightboxes.coffee
 */

import {debounce} from "../../utils"
import * as angular from "angular"

let module = angular.module("taigaKanban");

//############################################################################
//# Warning message directive
//############################################################################

let LightboxAddMembersWarningMessageDirective = () =>
    ({
          templateUrl: "admin/memberships-warning-message.html",
          scope: {
              project: "="
          }
    })
;

module.directive("tgLightboxAddMembersWarningMessage", [LightboxAddMembersWarningMessageDirective]);


//############################################################################
//# Transfer project ownership
//############################################################################

let LbRequestOwnershipDirective = (lightboxService, rs, confirmService, $translate) =>
    ({
        link(scope, el) {
            lightboxService.open(el);

            return scope.request = function() {
                scope.loading = true;

                return rs.projects.transferRequest(scope.projectId).then(function() {
                    scope.loading = false;

                    lightboxService.close(el);

                    return confirmService.notify("success", $translate.instant("ADMIN.PROJECT_PROFILE.REQUEST_OWNERSHIP_SUCCESS"));
                });
            };
        },

        templateUrl: "common/lightbox/lightbox-request-ownership.html"
    })
;

module.directive('tgLbRequestOwnership', [
    "lightboxService",
    "tgResources",
    "$tgConfirm",
    "$translate",
    LbRequestOwnershipDirective]);

class ChangeOwnerLightboxController {
    rs:any
    lightboxService:any
    confirm:any
    translate:any
    users:any
    q:string
    commentOpen:boolean

    static initClass() {
        this.prototype.limit = 3;
    }

    constructor(rs, lightboxService, confirm, translate) {
        this.rs = rs;
        this.lightboxService = lightboxService;
        this.confirm = confirm;
        this.translate = translate;
        this.users = [];
        this.q = "";
        this.commentOpen = false;
    }

    normalizeString(normalizedString:string):string {
        normalizedString = normalizedString.replace("Á", "A").replace("Ä", "A").replace("À", "A");
        normalizedString = normalizedString.replace("É", "E").replace("Ë", "E").replace("È", "E");
        normalizedString = normalizedString.replace("Í", "I").replace("Ï", "I").replace("Ì", "I");
        normalizedString = normalizedString.replace("Ó", "O").replace("Ö", "O").replace("Ò", "O");
        normalizedString = normalizedString.replace("Ú", "U").replace("Ü", "U").replace("Ù", "U");
        return normalizedString;
    }

    filterUsers(user) {
        let username = user.full_name_display.toUpperCase();
        username = this.normalizeString(username);
        let text = this.q.toUpperCase();
        text = this.normalizeString(text);

        return _.includes(username, text);
    }

    getUsers() {
        let users;
        if (!this.users.length && !this.q.length) {
            users =  this.activeUsers;
        } else {
            ({ users } = this);
        }

        users = users.slice(0, this.limit);
        users = _.reject(users, {"selected": true});

        return _.reject(users, {"id": this.currentOwnerId});
    }

    userSearch() {
        this.users = this.activeUsers;

        this.selected = _.find(this.users, {"selected": true});

        if (this.q) { return this.users = _.filter(this.users, this.filterUsers.bind(this)); }
    }

    selectUser(user) {
        this.activeUsers = _.map(this.activeUsers, function(user) {
            user.selected = false;

            return user;
        });

        user.selected = true;

        return this.userSearch();
    }

    submit() {
        this.loading = true;
        return this.rs.projects.transferStart(this.projectId, this.selected.id, this.comment)
            .then(() => {
                this.loading = false;
                this.lightboxService.closeAll();

                let title = this.translate.instant("ADMIN.PROJECT_PROFILE.CHANGE_OWNER_SUCCESS_TITLE");
                let desc = this.translate.instant("ADMIN.PROJECT_PROFILE.CHANGE_OWNER_SUCCESS_DESC");

                return this.confirm.success(title, desc, {
                    type: "svg",
                    name: "icon-speak-up"
                });
        });
    }
}
ChangeOwnerLightboxController.initClass();

ChangeOwnerLightboxController.$inject = [
        "tgResources",
        "lightboxService",
        "$tgConfirm",
        "$translate"
];

module.controller('ChangeOwnerLightbox', ChangeOwnerLightboxController);

let ChangeOwnerLightboxDirective = function(lightboxService, lightboxKeyboardNavigationService, $template, $compile) {
    let link = (scope, el) => lightboxService.open(el);

    return {
        scope: true,
        controller: "ChangeOwnerLightbox",
        controllerAs: "vm",
        bindToController: {
            currentOwnerId: "=",
            projectId: "=",
            activeUsers: "="
        },
        templateUrl: "common/lightbox/lightbox-change-owner.html",
        link
    };
};


module.directive("tgLbChangeOwner", ["lightboxService", "lightboxKeyboardNavigationService", "$tgTemplate", "$compile", ChangeOwnerLightboxDirective]);

let TransferProjectStartSuccessDirective = function(lightboxService) {
    let link = function(scope, el) {
        scope.close = () => lightboxService.close(el);

        return lightboxService.open(el);
    };

    return {
        templateUrl: "common/lightbox/lightbox-transfer-project-start-success.html",
        link
    };
};


module.directive("tgLbTransferProjectStartSuccess", ["lightboxService", TransferProjectStartSuccessDirective]);
