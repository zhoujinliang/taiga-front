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
 * File: attachments-preview.directive.coffee
 */

export let AttachmentPreviewLightboxDirective = function(lightboxService, attachmentsPreviewService) {
    let link = function($scope, el, attrs, ctrl) {
        $(document.body).on("keydown.image-preview", function(e) {
            if (attachmentsPreviewService.fileId) {
                if (e.keyCode === 39) {
                    ctrl.next();
                } else if (e.keyCode === 37) {
                    ctrl.previous();
                }
            }

            return $scope.$digest();
        });

        return $scope.$on('$destroy', () => $(document.body).off('.image-preview'));
    };

    return {
        scope: {},
        controller: 'AttachmentsPreview',
        templateUrl: 'components/attachments-preview/attachments-preview.html',
        link,
        controllerAs: "vm",
        bindToController: {
            attachments: "="
        }
    };
};
