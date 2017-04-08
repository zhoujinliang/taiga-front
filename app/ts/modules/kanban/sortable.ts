/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
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
 * File: modules/kanban/sortable.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"
import * as dragula from "dragula"
import {autoScroll} from "../../global"

let module = angular.module("taigaKanban");


//############################################################################
//# Sortable Directive
//############################################################################

let KanbanSortableDirective = function($repo, $rs, $rootscope) {
    let link = function($scope, $el, $attrs) {
        let unwatch;
        return unwatch = $scope.$watch("usByStatus", function(usByStatus) {
            if (!usByStatus || !usByStatus.size) { return; }

            unwatch();

            if (!($scope.project.my_permissions.indexOf("modify_us") > -1)) {
                return;
            }

            let oldParentScope = null;
            let newParentScope = null;
            let itemEl = null;
            let tdom = $el;

            let deleteElement = function(itemEl) {
                // Completelly remove item and its scope from dom
                itemEl.scope().$destroy();
                itemEl.off();
                return itemEl.remove();
            };

            let containers = _.map($el.find('.task-column'), item => item);

            let drake = dragula(containers, {
                copySortSource: false,
                copy: false,
                moves(item) {
                    return $(item).is('tg-card');
                }
            });

            drake.on('drag', item => oldParentScope = $(item).parent().scope());

            drake.on('dragend', function(item) {
                let parentEl = $(item).parent();
                itemEl = $(item);
                let itemUs = itemEl.scope().us;
                let itemIndex = itemEl.index();
                newParentScope = parentEl.scope();

                let newStatusId = newParentScope.s.id;
                let oldStatusId = oldParentScope.s.id;

                if (newStatusId !== oldStatusId) {
                    deleteElement(itemEl);
                }

                return $scope.$apply(() => $rootscope.$broadcast("kanban:us:move", itemUs, itemUs.getIn(['model', 'status']), newStatusId, itemIndex));
            });

            let scroll = autoScroll(containers, {
                margin: 100,
                pixels: 30,
                scrollWhenOutside: true,
                autoScroll() {
                    return this.down && drake.dragging;
                }
            });

            return $scope.$on("$destroy", function() {
                $el.off();
                return drake.destroy();
            });
        });
    };

    return {link};
};


module.directive("tgKanbanSortable", [
    "$tgRepo",
    "$tgResources",
    "$rootScope",
    KanbanSortableDirective
]);
