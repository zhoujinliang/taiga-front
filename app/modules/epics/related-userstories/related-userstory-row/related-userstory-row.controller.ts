/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: reñated-userstory-row.controller.coffee
 */

let module = angular.module("taigaEpics");

class RelatedUserstoryRowController {
    static initClass() {
        this.$inject = [
            "tgAvatarService",
            "$translate",
            "$tgConfirm",
            "tgResources"
        ];
    }

    constructor(avatarService, translate, confirm, rs) {
        this.avatarService = avatarService;
        this.translate = translate;
        this.confirm = confirm;
        this.rs = rs;
    }

    setAvatarData() {
        let member = this.userstory.get('assigned_to_extra_info');
        return this.avatar = this.avatarService.getAvatar(member);
    }

    getAssignedToFullNameDisplay() {
        if (this.userstory.get('assigned_to')) {
            return this.userstory.getIn(['assigned_to_extra_info', 'full_name_display']);
        }

        return this.translate.instant("COMMON.ASSIGNED_TO.NOT_ASSIGNED");
    }

    onDeleteRelatedUserstory() {
        let title = this.translate.instant('EPIC.TITLE_LIGHTBOX_UNLINK_RELATED_USERSTORY');
        let message = this.translate.instant('EPIC.MSG_LIGHTBOX_UNLINK_RELATED_USERSTORY', {
            subject: this.userstory.get('subject')
        });
        return this.confirm.askOnDelete(title, message)
            .then(askResponse => {
                let onError = () => {
                    message = this.translate.instant('EPIC.ERROR_UNLINK_RELATED_USERSTORY', {errorMessage: message});
                    this.confirm.notify("error", null, message);
                    return askResponse.finish(false);
                };

                let onSuccess = () => {
                    this.loadRelatedUserstories();
                    return askResponse.finish();
                };

                let epicId = this.epic.get('id');
                let userstoryId = this.userstory.get('id');
                return this.rs.epics.deleteRelatedUserstory(epicId, userstoryId).then(onSuccess, onError);
        });
    }
}
RelatedUserstoryRowController.initClass();

module.controller("RelatedUserstoryRowCtrl", RelatedUserstoryRowController);
