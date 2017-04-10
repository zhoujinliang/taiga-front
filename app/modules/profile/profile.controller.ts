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
 * File: profile.controller.coffee
 */

import * as angular from "angular"

export class ProfileController {
    appMetaService:any
    currentUserService:any
    routeParams:any
    userService:any
    xhrError:any
    translate:any
    isCurrentUser:boolean
    user:any

    static initClass() {
        this.$inject = [
            "tgAppMetaService",
            "tgCurrentUserService",
            "$routeParams",
            "tgUserService",
            "tgXhrErrorService",
            "$translate"
        ];
    }

    constructor(appMetaService, currentUserService, routeParams, userService, xhrError, translate) {
        this.appMetaService = appMetaService;
        this.currentUserService = currentUserService;
        this.routeParams = routeParams;
        this.userService = userService;
        this.xhrError = xhrError;
        this.translate = translate;
        this.isCurrentUser = false;

        if (this.routeParams.slug) {
            this.userService
                .getUserByUserName(this.routeParams.slug)
                .then(user => {
                    if (!user.get('is_active')) {
                        return this.xhrError.notFound();
                    } else {
                        this.user = user;
                        this.isCurrentUser = false;
                        this._setMeta(this.user);

                        return user;
                    }
            }).catch(xhr => {
                    return this.xhrError.response(xhr);
            });

        } else {
            this.user = this.currentUserService.getUser();
            this.isCurrentUser = true;
            this._setMeta(this.user);
        }
    }

    _setMeta(user) {
        let ctx = {
            userFullName: user.get("full_name_display"),
            userUsername: user.get("username")
        };

        let title = this.translate.instant("USER.PROFILE.PAGE_TITLE", ctx);

        let description = user.get("bio");
        return this.appMetaService.setAll(title, description);
    }
}
ProfileController.initClass();
