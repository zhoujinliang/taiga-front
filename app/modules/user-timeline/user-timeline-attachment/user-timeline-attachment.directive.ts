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
 * File: user-timeline-attachment.directive.coffee
 */

import * as _ from "lodash"

export let UserTimelineAttachmentDirective = function(template, $compile) {
    let validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];

    let isImage = function(url) {
        url = url.toLowerCase();

        return _.some(validFileExtensions, extension => url.indexOf(extension, url - extension.length) !== -1);
    };

    let link = function(scope, el) {
        let templateHtml;
        let is_image = isImage(scope.attachment.get('url'));

        if (is_image) {
            templateHtml = template.get("user-timeline/user-timeline-attachment/user-timeline-attachment-image.html");
        } else {
            templateHtml = template.get("user-timeline/user-timeline-attachment/user-timeline-attachment.html");
        }

        el.html(templateHtml);
        $compile(el.contents())(scope);

        return el.find("img").error(function() { return this.remove(); });
    };

    return {
        link,
        scope: {
            attachment: "=tgUserTimelineAttachment"
        }
    };
};

UserTimelineAttachmentDirective.$inject = [
    "$tgTemplate",
    "$compile"
];
