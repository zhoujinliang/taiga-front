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
 * File: modules/taskboard/sortable.coffee
 */

let { taiga } = this;

let { mixOf } = this.taiga;
let { toggleText } = this.taiga;
let { scopeDefer } = this.taiga;
let { bindOnce } = this.taiga;
let { groupBy } = this.taiga;

let module = angular.module("taigaBacklog");


//############################################################################
//# Sortable Directive
//############################################################################

let TaskboardSortableDirective = function($repo, $rs, $rootscope, $translate) {
    let link = function($scope, $el, $attrs) {
        let unwatch;
        return unwatch = $scope.$watch("usTasks", function(usTasks) {
            if (!usTasks || !usTasks.size) { return; }

            unwatch();

            if (!($scope.project.my_permissions.indexOf("modify_task") > -1)) {
                return;
            }

            let oldParentScope = null;
            let newParentScope = null;
            let itemEl = null;
            let tdom = $el;

            let filterError = function() {
                let text = $translate.instant("BACKLOG.SORTABLE_FILTER_ERROR");
                return $tgConfirm.notify("error", text);
            };

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
                accepts(el, target) { return !$(target).hasClass('taskboard-userstory-box'); },
                moves(item) {
                    return $(item).is('tg-card');
                }
            });

            drake.on('drag', function(item) {
                oldParentScope = $(item).parent().scope();

                if ($el.hasClass("active-filters")) {
                    filterError();

                    setTimeout((() => drake.cancel(true)), 0);

                    return false;
                }
            });

            drake.on('dragend', function(item) {
                let parentEl = $(item).parent();
                itemEl = $(item);
                let itemTask = itemEl.scope().task;
                let itemIndex = itemEl.index();
                newParentScope = parentEl.scope();

                let oldUsId = oldParentScope.us ? oldParentScope.us.id : null;
                let oldStatusId = oldParentScope.st.id;
                let newUsId = newParentScope.us ? newParentScope.us.id : null;
                let newStatusId = newParentScope.st.id;

                if ((newStatusId !== oldStatusId) || (newUsId !== oldUsId)) {
                    deleteElement(itemEl);
                }

                return $scope.$apply(() => $rootscope.$broadcast("taskboard:task:move", itemTask, itemTask.getIn(['model', 'status']), newUsId, newStatusId, itemIndex));
            });


            let scroll = autoScroll([$('.taskboard-table-body')[0]], {
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


module.directive("tgTaskboardSortable", [
    "$tgRepo",
    "$tgResources",
    "$rootScope",
    "$translate",
    TaskboardSortableDirective
]);
