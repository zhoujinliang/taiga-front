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
 * File: modules/user-settings/notifications.coffee
 */

import {bindOnce} from "../../utils"
import {PageMixin} from "../controllerMixins"

import * as angular from "angular"
import * as _ from "lodash"

//############################################################################
//# User settings Controller
//############################################################################

export class UserNotificationsController extends PageMixin {
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
    errorHandlingService:any

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
            "tgErrorHandlingService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls, auth, errorHandlingService) {
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
        this.errorHandlingService = errorHandlingService;
        this.scope.sectionName = "USER_SETTINGS.NOTIFICATIONS.SECTION_NAME";
        this.scope.user = this.auth.getUser();
        let promise = this.loadInitialData();
        promise.then(null, this.onInitialDataError.bind(this));
    }

    loadInitialData() {
        return this.rs.notifyPolicies.list().then(notifyPolicies => {
            this.scope.notifyPolicies = notifyPolicies;
            return notifyPolicies;
        });
    }
}
UserNotificationsController.initClass();

//############################################################################
//# User Notifications Directive
//############################################################################

export let UserNotificationsDirective = function() {
    let link = ($scope, $el, $attrs) =>
        $scope.$on("$destroy", () => $el.off())
    ;

    return {link};
};

//############################################################################
//# User Notifications List Directive
//############################################################################

export let UserNotificationsListDirective = function($repo, $confirm, $compile) {
    let template = _.template(`\
<% _.each(notifyPolicies, function (notifyPolicy, index) { %>
<div class="policy-table-row" data-index="<%- index %>">
  <div class="policy-table-project"><span><%- notifyPolicy.project_name %></span></div>
  <div class="policy-table-all">
    <fieldset>
      <input type="radio"
             name="policy-<%- notifyPolicy.id %>" id="policy-all-<%- notifyPolicy.id %>"
             value="2" <% if (notifyPolicy.notify_level == 2) { %>checked="checked"<% } %>/>
      <label for="policy-all-<%- notifyPolicy.id %>"
             translate="USER_SETTINGS.NOTIFICATIONS.OPTION_ALL"></label>
    </fieldset>
  </div>
  <div class="policy-table-involved">
    <fieldset>
      <input type="radio"
             name="policy-<%- notifyPolicy.id %>" id="policy-involved-<%- notifyPolicy.id %>"
             value="1" <% if (notifyPolicy.notify_level == 1) { %>checked="checked"<% } %> />
      <label for="policy-involved-<%- notifyPolicy.id %>"
             translate="USER_SETTINGS.NOTIFICATIONS.OPTION_INVOLVED"></label>
    </fieldset>
  </div>
  <div class="policy-table-none">
    <fieldset>
      <input type="radio"
             name="policy-<%- notifyPolicy.id %>" id="policy-none-<%- notifyPolicy.id %>"
             value="3" <% if (notifyPolicy.notify_level == 3) { %>checked="checked"<% } %> />
      <label for="policy-none-<%- notifyPolicy.id %>"
             translate="USER_SETTINGS.NOTIFICATIONS.OPTION_NONE"></label>
    </fieldset>
  </div>
</div>
<% }) %>\
`);

    let link = function($scope, $el, $attrs) {
        let render = function() {
            $el.off();

            let ctx = {notifyPolicies: $scope.notifyPolicies};
            let html = template(ctx);

            $el.html($compile(html)($scope));

            return $el.on("change", "input[type=radio]", function(event) {
                let target = angular.element(event.currentTarget);

                let policyIndex = target.parents(".policy-table-row").data('index');
                let policy = $scope.notifyPolicies[policyIndex];
                let prev_level = policy.notify_level;
                policy.notify_level = parseInt(target.val(), 10);

                let onSuccess = () => $confirm.notify("success");

                let onError = function() {
                    $confirm.notify("error");
                    return target.parents(".policy-table-row")
                          .find(`input[value=${prev_level}]`)
                          .prop("checked", true);
                };

                return $repo.save(policy).then(onSuccess, onError);
            });
        };

        $scope.$on("$destroy", () => $el.off());

        return bindOnce($scope, $attrs.ngModel, render);
    };

    return {link};
};
