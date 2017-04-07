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
 * File: attachment-link.directive.coffee
 */

let AttachmentLinkDirective = function($parse, attachmentsPreviewService, lightboxService) {
    let link = function(scope, el, attrs) {
        let attachment = $parse(attrs.tgAttachmentLink)(scope);

        el.on("click", function(event) {
            if (taiga.isImage(attachment.getIn(['file', 'name']))) {
                event.preventDefault();

                return scope.$apply(function() {
                    lightboxService.open($('tg-attachments-preview'));
                    return attachmentsPreviewService.fileId = attachment.getIn(['file', 'id']);
                });
            } else if (taiga.isPdf(attachment.getIn(['file', 'name']))) {
                event.preventDefault();
                return window.open(attachment.getIn(['file', 'url']));
            }
        });

        return scope.$on("$destroy", () => el.off());
    };
    return {
        link
    };
};

AttachmentLinkDirective.$inject = [
    "$parse",
    "tgAttachmentsPreviewService",
    "lightboxService"
];

angular.module("taigaComponents").directive("tgAttachmentLink", AttachmentLinkDirective);
