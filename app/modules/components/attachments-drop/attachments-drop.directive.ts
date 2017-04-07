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
 * File: attachments-drop.directive.coffee
 */

let AttachmentsDropDirective = function($parse) {
    let link = function(scope, el, attrs) {
        let eventAttr = $parse(attrs.tgAttachmentsDrop);

        el.on('dragover', function(e) {
            e.preventDefault();
            return false;
        });

        el.on('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();

            let dataTransfer = e.dataTransfer || (e.originalEvent && e.originalEvent.dataTransfer);

            return scope.$apply(() => eventAttr(scope, {files: dataTransfer.files}));
        });

        return scope.$on("$destroy", () => el.off());
    };

    return {
        link
    };
};

AttachmentsDropDirective.$inject = [
    "$parse"
];

angular.module("taigaComponents").directive("tgAttachmentsDrop", AttachmentsDropDirective);
