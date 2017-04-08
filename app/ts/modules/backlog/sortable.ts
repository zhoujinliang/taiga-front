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
 * File: modules/backlog/sortable.coffee
 */


import * as angular from "angular"
import * as _ from "lodash"
import * as dragula from "dragula"
import {bindOnce} from "../../utils"
import {autoScroll} from "../../global"

let module = angular.module("taigaBacklog");

//############################################################################
//# Sortable Directive
//############################################################################

let deleteElement = function(el) {
    $(el).scope().$destroy();
    $(el).off();
    return $(el).remove();
};

let BacklogSortableDirective = function() {
    let link = ($scope, $el, $attrs) =>
        bindOnce($scope, "project", function(project) {
            // If the user has not enough permissions we don't enable the sortable
            if (!(project.my_permissions.indexOf("modify_us") > -1)) {
                return;
            }

            let initIsBacklog = false;

            let drake = dragula([$el[0], $('.js-empty-backlog')[0]], {
                copySortSource: false,
                copy: false,
                isContainer(el) { return el.classList.contains('sprint-table'); },
                moves(item) {
                    if (!$(item).hasClass('row')) {
                        return false;
                    }

                    return true;
                }
            });

            drake.on('drag', function(item, container) {
                // it doesn't move is the filter is open
                let parent = $(item).parent();
                initIsBacklog = parent.hasClass('backlog-table-body');

                $(document.body).addClass("drag-active");

                let isChecked = $(item).find("input[type='checkbox']").is(":checked");

                return (<any>window).dragMultiple.start(item, container);
            });

            drake.on('cloned', item => $(item).addClass('backlog-us-mirror'));

            drake.on('dragend', function(item) {
                let index, sameContainer, usList;
                let parent = $(item).parent();

                $('.doom-line').remove();

                parent = $(item).parent();

                let isBacklog = parent.hasClass('backlog-table-body') || parent.hasClass('js-empty-backlog');

                if (initIsBacklog || isBacklog) {
                    sameContainer = (initIsBacklog === isBacklog);
                } else {
                    sameContainer = $(item).scope().sprint.id === parent.scope().sprint.id;
                }

                let dragMultipleItems = (<any>window).dragMultiple.stop();

                $(document.body).removeClass("drag-active");

                let sprint = null;

                let firstElement = dragMultipleItems.length ? dragMultipleItems[0] : item;

                if (isBacklog) {
                    index = $(firstElement).index(".backlog-table-body .row");
                } else {
                    index = $(firstElement).index();
                    sprint = parent.scope().sprint.id;
                }

                if (!sameContainer) {
                    if (dragMultipleItems.length) {
                        usList = _.map(dragMultipleItems, item => item = $(item).scope().us);
                    } else {
                        usList = [$(item).scope().us];
                    }

                    if (dragMultipleItems.length) {
                        _.each(dragMultipleItems, item => deleteElement(item));
                    } else {
                        deleteElement(item);
                    }
                } else {
                    if (dragMultipleItems.length) {
                        usList = _.map(dragMultipleItems, item => item = $(item).scope().us);
                    } else {
                        usList = [$(item).scope().us];
                    }
                }

                return $scope.$emit("sprint:us:move", usList, index, sprint);
            });

            let scroll = autoScroll([window], {
                margin: 20,
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
        })
    ;

    return {link};
};

module.directive("tgBacklogSortable", BacklogSortableDirective);
