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
 * File: taskboard-zoom.directive.coffee
 */

let TaskboardZoomDirective = function(storage) {
    let link = function(scope, el, attrs, ctrl) {
        scope.zoomIndex = storage.get("taskboard_zoom") || 2;

        scope.levels = 4;

        let zooms = [
            ["ref"],
            ["subject"],
            ["owner", "tags", "extra_info", "unfold"],
            ["attachments", "empty_extra_info"],
            ["related_tasks"]
        ];

        let getZoomView = function(zoomIndex) {
            if (zoomIndex == null) { zoomIndex = 0; }
            if (storage.get("taskboard_zoom") !== zoomIndex) {
                storage.set("taskboard_zoom", zoomIndex);
            }

            return _.reduce(zooms, function(result, value, key) {
                if (key <= zoomIndex) {
                    result = result.concat(value);
                }

                return result;
            });
        };

        return scope.$watch('zoomIndex', function(zoomLevel) {
            let zoom = getZoomView(zoomLevel);
            return scope.onZoomChange({zoomLevel, zoom});
        });
    };

    return {
        scope: {
            onZoomChange: "&"
        },
        template: `\
<tg-board-zoom
    levels="levels"
    class="board-zoom"
    value="zoomIndex"
></tg-board-zoom>\
`,
        link
    };
};

angular.module('taigaComponents').directive("tgTaskboardZoom", ["$tgStorage", TaskboardZoomDirective]);
