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
 * File: attchments-preview.controller.coffee
 */

class AttachmentsPreviewController {
    static initClass() {
        this.$inject = [
            "tgAttachmentsPreviewService"
        ];
    }

    constructor(attachmentsPreviewService) {
        this.attachmentsPreviewService = attachmentsPreviewService;
        taiga.defineImmutableProperty(this, "current", () => {
            if (!this.attachmentsPreviewService.fileId) {
                return null;
            }

            return this.getCurrent();
        });
    }

    hasPagination() {
        let images = this.attachments.filter(attachment => {
            return taiga.isImage(attachment.getIn(['file', 'name']));
        });

        return images.size > 1;
    }

    getCurrent() {
        let attachment = this.attachments.find(attachment => {
            return this.attachmentsPreviewService.fileId === attachment.getIn(['file', 'id']);
        });

        let file = attachment.get('file');

        return file;
    }

    getIndex() {
        return this.attachments.findIndex(attachment => {
            return this.attachmentsPreviewService.fileId === attachment.getIn(['file', 'id']);
        });
    }

    next() {
        let attachmentIndex = this.getIndex();

        let image = this.attachments.slice(attachmentIndex + 1).find(attachment => taiga.isImage(attachment.getIn(['file', 'name'])));

        if (!image) {
            image = this.attachments.find(attachment => taiga.isImage(attachment.getIn(['file', 'name'])));
        }


        return this.attachmentsPreviewService.fileId = image.getIn(['file', 'id']);
    }

    previous() {
        let attachmentIndex = this.getIndex();

        let image = this.attachments.slice(0, attachmentIndex).findLast(attachment => taiga.isImage(attachment.getIn(['file', 'name'])));

        if (!image) {
            image = this.attachments.findLast(attachment => taiga.isImage(attachment.getIn(['file', 'name'])));
        }

        return this.attachmentsPreviewService.fileId = image.getIn(['file', 'id']);
    }
}
AttachmentsPreviewController.initClass();

angular.module('taigaComponents').controller('AttachmentsPreview', AttachmentsPreviewController);
