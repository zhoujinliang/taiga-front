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
 * File: import-project.service.coffee
 */

import {Service} from "../../../../ts/classes"
import * as angular from "angular"

class ImportProjectService extends Service {
    currentUserService:any
    tgAuth:any
    lightboxFactory:any
    translate:any
    confirm:any
    location:any
    tgNavUrls:any

    static initClass() {
        this.$inject = [
            'tgCurrentUserService',
            '$tgAuth',
            'tgLightboxFactory',
            '$translate',
            '$tgConfirm',
            '$location',
            '$tgNavUrls'
        ];
    }

    constructor(currentUserService, tgAuth, lightboxFactory, translate, confirm, location, tgNavUrls) {
        super()
        this.currentUserService = currentUserService;
        this.tgAuth = tgAuth;
        this.lightboxFactory = lightboxFactory;
        this.translate = translate;
        this.confirm = confirm;
        this.location = location;
        this.tgNavUrls = tgNavUrls;
    }

    importPromise(promise) {
        return promise.then(this.importSuccess.bind(this), this.importError.bind(this));
    }

    importSuccess(result) {
        let promise = this.currentUserService.loadProjects();
        promise.then(() => {
            if (result.status === 202) { // Async mode
                let title = this.translate.instant('PROJECT.IMPORT.ASYNC_IN_PROGRESS_TITLE');
                let message = this.translate.instant('PROJECT.IMPORT.ASYNC_IN_PROGRESS_MESSAGE');
                this.location.path(this.tgNavUrls.resolve('home'));
                return this.confirm.success(title, message);
            } else { // result.status == 201 # Sync mode
                let ctx = {project: result.data.slug};
                this.location.path(this.tgNavUrls.resolve('project-admin-project-profile-details', ctx));
                let msg = this.translate.instant('PROJECT.IMPORT.SYNC_SUCCESS');
                return this.confirm.notify('success', msg);
            }
        });
        return promise;
    }

    importError(result) {
        let promise = this.tgAuth.refresh();
        promise.then(() => {
            let restrictionError = this.getRestrictionError(result);

            if (restrictionError) {
                return this.lightboxFactory.create('tg-lb-import-error', {
                    class: 'lightbox lightbox-import-error'
                }, restrictionError);

            } else {
                let errorMsg = this.translate.instant("PROJECT.IMPORT.ERROR");

                if (result.status === 429) {  // TOO MANY REQUESTS
                    errorMsg = this.translate.instant("PROJECT.IMPORT.ERROR_TOO_MANY_REQUEST");
                } else if (result.data != null ? result.data._error_message : undefined) {
                    errorMsg = this.translate.instant("PROJECT.IMPORT.ERROR_MESSAGE", {error_message: result.data._error_message});
                }

                return this.confirm.notify("error", errorMsg);
            }
        });
        return promise;
    }

    getRestrictionError(result) {
        if (result.headers) {
            let membersError;
            let errorKey = '';

            let user = this.currentUserService.getUser();
            let maxMemberships = null;

            if (result.headers.isPrivate) {
                let privateError = !this.currentUserService.canCreatePrivateProjects().valid;

                if ((user.get('max_memberships_private_projects') !== null) && (result.headers.memberships >= user.get('max_memberships_private_projects'))) {
                    membersError = true;
                } else {
                    membersError = false;
                }

                if (privateError && membersError) {
                    errorKey = 'private-space-members';
                    maxMemberships = user.get('max_memberships_private_projects');
                } else if (privateError) {
                    errorKey = 'private-space';
                } else if (membersError) {
                    errorKey = 'private-members';
                    maxMemberships = user.get('max_memberships_private_projects');
                }

            } else {
                let publicError = !this.currentUserService.canCreatePublicProjects().valid;

                if ((user.get('max_memberships_public_projects') !== null) && (result.headers.memberships >= user.get('max_memberships_public_projects'))) {
                    membersError = true;
                } else {
                    membersError = false;
                }

                if (publicError && membersError) {
                    errorKey = 'public-space-members';
                    maxMemberships = user.get('max_memberships_public_projects');
                } else if (publicError) {
                    errorKey = 'public-space';
                } else if (membersError) {
                    errorKey = 'public-members';
                    maxMemberships = user.get('max_memberships_public_projects');
                }
            }

            if (!errorKey) {
                return false;
            }

            return {
                key: errorKey,
                values: {
                    max_memberships: maxMemberships,
                    members: result.headers.memberships
                }
            };
        } else {
            return false;
        }
    }
}
ImportProjectService.initClass();

angular.module("taigaProjects").service("tgImportProjectService", ImportProjectService);
