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
 * File: external-app.controller.coffee
 */

import {defineImmutableProperty} from "../../ts/utils"
import {Controller} from "../../ts/classes"
import * as angular from "angular"
import * as Immutable from "immutable"

export class ExternalAppController extends Controller {
    routeParams:any
    externalAppsService:any
    window:any
    currentUserService:any
    location:any
    navUrls:any
    xhrError:any
    loader:any
    _state:any
    _applicationId:any
    _user:any
    _application:any
    loginWithAnotherUserUrl:any

    static initClass() {
        this.$inject = [
            "$routeParams",
            "tgExternalAppsService",
            "$window",
            "tgCurrentUserService",
            "$location",
            "$tgNavUrls",
            "tgXhrErrorService",
            "tgLoader"
        ];
    }

    constructor(routeParams, externalAppsService, window, currentUserService, location,
                navUrls, xhrError, loader) {
        super()
        this._redirect = this._redirect.bind(this);
        this._getApplicationToken = this._getApplicationToken.bind(this);
        this.createApplicationToken = this.createApplicationToken.bind(this);
        this.routeParams = routeParams;
        this.externalAppsService = externalAppsService;
        this.window = window;
        this.currentUserService = currentUserService;
        this.location = location;
        this.navUrls = navUrls;
        this.xhrError = xhrError;
        this.loader = loader;
        this.loader.start(false);
        this._applicationId = this.routeParams.application;
        this._state = this.routeParams.state;
        this._getApplicationToken();
        this._user = this.currentUserService.getUser();
        this._application = null;
        let nextUrl = encodeURIComponent(this.location.url());
        let loginUrl = this.navUrls.resolve("login");
        this.loginWithAnotherUserUrl = `${loginUrl}?next=${nextUrl}`;

        defineImmutableProperty(this, "user", () => this._user);
        defineImmutableProperty(this, "application", () => this._application);
    }

    _redirect(applicationToken) {
        let nextUrl = applicationToken.get("next_url");
        return this.window.open(nextUrl, "_self");
    }

    _getApplicationToken() {
        return this.externalAppsService.getApplicationToken(this._applicationId, this._state)
            .then(data => {
                this._application = data.get("application");
                if (data.get("auth_code")) {
                    return this._redirect(data);
                } else {
                    return this.loader.pageLoaded();
                }
        }).catch(xhr => {
                this.loader.pageLoaded();
                return this.xhrError.response(xhr);
        });
    }

    cancel() {
        return this.window.history.back();
    }

    createApplicationToken() {
        return this.externalAppsService.authorizeApplicationToken(this._applicationId, this._state)
            .then(data => {
                return this._redirect(data);
        }).catch(xhr => {
                return this.xhrError.response(xhr);
        });
    }
}
ExternalAppController.initClass();
