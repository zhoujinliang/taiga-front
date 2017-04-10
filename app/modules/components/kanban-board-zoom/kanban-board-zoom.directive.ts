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
 * File: kanban-board-zoom.directive.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

export let KanbanBoardZoomDirective = function(storage, projectService) {
    let link = function(scope, el, attrs, ctrl) {
        let unwatch;
        scope.zoomIndex = storage.get("kanban_zoom") || 2;
        scope.levels = 5;

        let zooms = [
            ["ref"],
            ["subject"],
            ["owner", "tags", "extra_info", "unfold"],
            ["attachments"],
            ["related_tasks", "empty_extra_info"]
        ];

        let getZoomView = function(zoomIndex) {
            if (zoomIndex == null) { zoomIndex = 0; }
            if (storage.get("kanban_zoom") !== zoomIndex) {
                storage.set("kanban_zoom", zoomIndex);
            }

            return _.reduce(zooms, function(result:string[], value, key) {
                if (key <= zoomIndex) {
                    result = result.concat(value);
                }

                return result;
            });
        };

        scope.$watch('zoomIndex', function(zoomLevel) {
            let zoom = getZoomView(zoomLevel);
            return scope.onZoomChange({zoomLevel, zoom});
        });

        return unwatch = scope.$watch(() => projectService.project
        , function(project) {
            if (project) {
                if (project.get('my_permissions').indexOf("view_tasks") === -1) {
                    scope.levels = 4;
                }
                return unwatch();
            }
        });
    };

    return {
        scope: {
            onZoomChange: "&"
        },
        template: `\
<tg-board-zoom
    class="board-zoom"
    value="zoomIndex"
    levels="levels"
></tg-board-zoom>\
`,
        link
    };
};
