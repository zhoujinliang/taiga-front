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
 * File: modules/user-settings/main.coffee
 */

import {debounce} from "../../utils"
import {checksley} from "../../global"
import {PageMixin} from "../controllerMixins"
import * as angular from "angular"

//############################################################################
//# User ChangePassword Controller
//############################################################################

export class UserChangePasswordController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    navUrls:any
    auth:any
    translate:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$tgNavUrls",
            "$tgAuth",
            "$translate"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls,
                  auth, translate) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.auth = auth;
        this.translate = translate;
        this.scope.sectionName = this.translate.instant("CHANGE_PASSWORD.SECTION_NAME");
        this.scope.user = this.auth.getUser();
    }
}
UserChangePasswordController.initClass();

//############################################################################
//# User ChangePassword Directive
//############################################################################

export let UserChangePasswordDirective = function($rs, $confirm, $loading, $translate) {
    let link = function($scope, $el, $attrs, ctrl) {
        let form = new checksley.Form($el.find("form"));

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            if ($scope.newPassword1 !== $scope.newPassword2) {
                $confirm.notify('error', $translate.instant("CHANGE_PASSWORD.ERROR_PASSWORD_MATCH"));
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $rs.userSettings.changePassword($scope.currentPassword, $scope.newPassword1);
            promise.then(() => {
                currentLoading.finish();
                return $confirm.notify('success');
            });

            return promise.then(null, response => {
                currentLoading.finish();
                return $confirm.notify('error', response.data._error_message);
            });
        });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link
    };
};
