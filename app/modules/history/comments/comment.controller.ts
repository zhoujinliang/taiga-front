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
 * File: history.controller.coffee
 */

let module = angular.module("taigaHistory");

class CommentController {
    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "tgCheckPermissionsService",
            "tgLightboxFactory"
        ];
    }

    constructor(currentUserService, permissionService, lightboxFactory) {
        this.currentUserService = currentUserService;
        this.permissionService = permissionService;
        this.lightboxFactory = lightboxFactory;
        this.hiddenDeletedComment = true;
    }

    showDeletedComment() {
        return this.hiddenDeletedComment = false;
    }

    hideDeletedComment() {
        return this.hiddenDeletedComment = true;
    }

    checkCancelComment(event) {
        if (event.keyCode === 27) {
            return this.onEditMode({commentId: this.comment.id});
        }
    }

    canEditDeleteComment() {
        if (this.currentUserService.getUser()) {
            this.user = this.currentUserService.getUser();
            return (this.user.get('id') === this.comment.user.pk) || this.permissionService.check('modify_project');
        }
    }

    saveComment(text, cb) {
        return this.onEditComment({commentId: this.comment.id, commentData: text, callback: cb});
    }

    displayCommentHistory() {
        return this.lightboxFactory.create('tg-lb-display-historic', {
            "class": "lightbox lightbox-display-historic",
            "comment": "comment",
            "name": "name",
            "object": "object"
        }, {
            "comment": this.comment,
            "name": this.name,
            "object": this.object
        });
    }
}
CommentController.initClass();

module.controller("CommentCtrl", CommentController);
