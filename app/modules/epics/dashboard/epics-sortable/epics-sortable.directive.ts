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
 * File: epics-sortable.directive.coffee
 */

import {autoScroll} from "../../../../ts/libs/dom-autoscroller"

import * as dragula from "dragula"
import * as angular from "angular"

export let EpicsSortableDirective = function($parse, projectService) {
    let link = function(scope, el, attrs) {
        if (!projectService.hasPermission("modify_epic")) { return; }

        let callback = $parse(attrs.tgEpicsSortable);

        let drake = dragula([el[0]], {
            copySortSource: false,
            copy: false,
            mirrorContainer: el[0],
            moves(item) {
                return $(item).is('div.epics-table-body-row');
            }
        });

        drake.on('dragend', function(item) {
            let itemEl = $(item);

            let { epic } = itemEl.scope();
            let newIndex = itemEl.index();

            return scope.$apply(() => callback(scope, {epic, newIndex}));
        });

        let scroll = autoScroll(window, {
            margin: 20,
            pixels: 30,
            scrollWhenOutside: true,
            autoScroll() {
                return this.down && drake.dragging;
            }
        });

        return scope.$on("$destroy", function() {
            el.off();
            return drake.destroy();
        });
    };

    return {
        link
    };
};

EpicsSortableDirective.$inject = [
    "$parse",
    "tgProjectService"
];
