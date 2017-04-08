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
 * File: modules/common/popovers.coffee
 */

import {bindOnce, debounce} from "../../utils"
import * as angular from "angular"

let module = angular.module("taigaCommon");

//############################################################################
//# UserStory status Directive (popover for change status)
//############################################################################

let UsStatusDirective = function($repo, $template) {
    /*
    Print the status of a US and a popover to change it.
    - tg-us-status: The user story
    - on-update: Method call after US is updated

    Example:

      div.status(tg-us-status="us" on-update="ctrl.loadSprintState()")
        a.us-status(href="", title="Status Name")

    NOTE: This directive need 'usStatusById' and 'project'.
    */
    let template = $template.get("common/popover/popover-us-status.html", true);

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        let render = function(us) {
            let usStatusDomParent = $el.find(".us-status");
            let usStatusDom = $el.find(".us-status .us-status-bind");
            let { usStatusById } = $scope;

            if (usStatusById[us.status]) {
                usStatusDom.text(usStatusById[us.status].name);
                return usStatusDomParent.css("color", usStatusById[us.status].color);
            }
        };

        $el.on("click", ".us-status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            return $el.find(".pop-status").popover().open();
        });

        $el.on("click", ".status", debounce(2000, function(event) {
            event.preventDefault();
            event.stopPropagation();

            let target = angular.element(event.currentTarget);

            let us = $scope.$eval($attrs.tgUsStatus);
            us.status = target.data("status-id");
            render(us);

            $el.find(".pop-status").popover().close();

            return $scope.$apply(() =>
                $repo.save(us).then(() => $scope.$eval($attrs.onUpdate))
            );
        })
        );


        $scope.$on("userstories:loaded", () => render($scope.$eval($attrs.tgUsStatus)));
        $scope.$on("$destroy", () => $el.off());

        // Bootstrap
        let us = $scope.$eval($attrs.tgUsStatus);
        render(us);

        return bindOnce($scope, "project", function(project) {
            let html = template({"statuses": project.us_statuses});
            $el.append(html);

            // If the user has not enough permissions the click events are unbinded
            if ($scope.project.my_permissions.indexOf("modify_us") === -1) {
                $el.unbind("click");
                return $el.find("a").addClass("not-clickable");
            }
        });
    };


    return {link};
};

module.directive("tgUsStatus", ["$tgRepo", "$tgTemplate", UsStatusDirective]);

//############################################################################
//# Related Task Status Directive
//############################################################################

let RelatedTaskStatusDirective = function($repo, $template) {
    /*
    Print the status of a related task and a popover to change it.
    - tg-related-task-status: The related task
    - on-update: Method call after US is updated

    Example:

      div.status(tg-related-task-status="task" on-update="ctrl.loadSprintState()")
        a.task-status(href="", title="Status Name")

    NOTE: This directive need 'taskStatusById' and 'project'.
    */
    let selectionTemplate = $template.get("common/popover/popover-related-task-status.html", true);

    let updateTaskStatus = function($el, task, taskStatusById) {
        let taskStatusDomParent = $el.find(".us-status");
        let taskStatusDom = $el.find(".task-status .task-status-bind");

        if (taskStatusById[task.status]) {
            taskStatusDom.text(taskStatusById[task.status].name);
            return taskStatusDomParent.css('color', taskStatusById[task.status].color);
        }
    };

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        let task = $scope.$eval($attrs.tgRelatedTaskStatus);
        let notAutoSave = $scope.$eval($attrs.notAutoSave);
        let autoSave = !notAutoSave;

        $el.on("click", ".task-status", function(event) {
            event.preventDefault();
            event.stopPropagation();

            return $el.find(".pop-status").popover().open();
        });

            // pop = $el.find(".pop-status")
            // popoverService.open(pop)

        $el.on("click", ".status", debounce(2000, function(event) {
            event.preventDefault();
            event.stopPropagation();
            let target = angular.element(event.currentTarget);
            task.status = target.data("status-id");
            $el.find(".pop-status").popover().close();
            updateTaskStatus($el, task, $scope.taskStatusById);

            if (autoSave) {
                return $scope.$apply(() =>
                    $repo.save(task).then(function() {
                        $scope.$eval($attrs.onUpdate);
                        return $scope.$emit("related-tasks:status-changed");
                    })
                );
            }
        })
        );

        $scope.$watch($attrs.tgRelatedTaskStatus, function() {
            task = $scope.$eval($attrs.tgRelatedTaskStatus);
            return updateTaskStatus($el, task, $scope.taskStatusById);
        });

        bindOnce($scope, "project", function(project) {
            $el.append(selectionTemplate({ 'statuses':  project.task_statuses }));
            updateTaskStatus($el, task, $scope.taskStatusById);

            // If the user has not enough permissions the click events are unbinded
            if (project.my_permissions.indexOf("modify_task") === -1) {
                $el.unbind("click");
                return $el.find("a").addClass("not-clickable");
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgRelatedTaskStatus", ["$tgRepo", "$tgTemplate", RelatedTaskStatusDirective]);

//############################################################################
//# jQuery plugin for Popover
//############################################################################

$.fn.popover = function() {
    let $el = this;

    let isVisible = () => {
        $el.css({
            "display": "block",
            "visibility": "hidden"
        });

        let docViewTop = $(window).scrollTop();
        let docViewBottom = docViewTop + $(window).height();

        let docViewWidth = $(window).width();
        let docViewRight = docViewWidth;
        let docViewLeft = 0;

        let elemTop = $el.offset().top;
        let elemBottom = elemTop + $el.height();

        let elemWidth = $el.width();
        let elemLeft = $el.offset().left;
        let elemRight = $el.offset().left + elemWidth;

        $el.css({
            "display": "none",
            "visibility": "visible"
        });

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop) && (elemLeft >= docViewLeft) && (elemRight <= docViewRight));
    };

    let closePopover = onClose => {
        if (onClose) { onClose.call($el); }

        $el.fadeOut(() => {
            return $el
                .removeClass("active")
                .removeClass("fix");
        });

        return $el.off("popup:close");
    };


    let closeAll = () => {
        return $(".popover.active").each(function(index, element) {
            $(this).trigger("popup:close");
            return true;
        });
    };

    let open = onClose => {
        if ($el.hasClass("active")) {
            return close();
        } else {
            closeAll();

            if (!isVisible()) {
                $el.addClass("fix");
            }

            $el.fadeIn(() => {
                $el.addClass("active");
                $(document.body).off("popover");

                return $(document.body).one("click.popover", () => {
                    return closeAll();
                });
            });

            return $el.on("popup:close", e => closePopover(onClose));
        }
    };

    var close = () => {
        return $el.trigger("popup:close");
    };

    return {open, close, closeAll};
};
