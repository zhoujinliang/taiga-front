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
 * File: modules/backlog/sprints.coffee
 */

let { taiga } = this;

let module = angular.module("taigaBacklog");


//############################################################################
//# Sprint Actions Directive
//############################################################################

let BacklogSprintDirective = function($repo, $rootscope) {
    let sprintTableMinHeight = 50;
    let slideOptions = {
        duration: 500,
        easing: 'linear'
    };

    let toggleSprint = $el => {
        let sprintTable = $el.find(".sprint-table");
        let sprintArrow = $el.find(".compact-sprint");

        sprintArrow.toggleClass('active');
        return sprintTable.toggleClass('open');
    };

    let link = function($scope, $el, $attrs) {
        $scope.$watch($attrs.tgBacklogSprint, function(sprint) {
            sprint = $scope.$eval($attrs.tgBacklogSprint);

            if (sprint.closed) {
                return $el.addClass("sprint-closed");
            } else {
                return toggleSprint($el);
            }
        });

        // Event Handlers
        $el.on("click", ".sprint-name > .compact-sprint", function(event) {
            event.preventDefault();

            toggleSprint($el);

            return $el.find(".sprint-table").slideToggle(slideOptions);
        });

        $el.on("click", ".edit-sprint", function(event) {
            event.preventDefault();

            let sprint = $scope.$eval($attrs.tgBacklogSprint);
            return $rootscope.$broadcast("sprintform:edit", sprint);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgBacklogSprint", ["$tgRepo", "$rootScope", BacklogSprintDirective]);


//############################################################################
//# Sprint Header Directive
//############################################################################

let BacklogSprintHeaderDirective = function($navUrls, $template, $compile, $translate) {
    let template = $template.get("backlog/sprint-header.html");

    let link = function($scope, $el, $attrs, $model) {
        let prettyDate = $translate.instant("BACKLOG.SPRINTS.DATE");

        let isEditable = () => $scope.project.my_permissions.indexOf("modify_milestone") !== -1;

        let isVisible = () => $scope.project.my_permissions.indexOf("view_milestones") !== -1;

        let render = function(sprint) {
            let taskboardUrl = $navUrls.resolve("project-taskboard",
                                            {project: $scope.project.slug, sprint: sprint.slug});

            let start = moment(sprint.estimated_start).format(prettyDate);
            let finish = moment(sprint.estimated_finish).format(prettyDate);

            let estimatedDateRange = `${start}-${finish}`;

            let ctx = {
                name: sprint.name,
                taskboardUrl,
                estimatedDateRange,
                closedPoints: sprint.closed_points || 0,
                totalPoints: sprint.total_points || 0,
                isVisible: isVisible(),
                isEditable: isEditable()
            };

            let templateScope = $scope.$new();

            _.assign(templateScope, ctx);

            let compiledTemplate = $compile(template)(templateScope);
            return $el.html(compiledTemplate);
        };

        $scope.$watch("sprint", sprint => render(sprint));

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA"
    };
};

module.directive("tgBacklogSprintHeader", ["$tgNavUrls", "$tgTemplate", "$compile", "$translate",
                                           BacklogSprintHeaderDirective]);


//############################################################################
//# Toggle Closed Sprints Directive
//############################################################################

let ToggleExcludeClosedSprintsVisualization = function($rootscope, $loading, $translate) {
    let excludeClosedSprints = true;

    let link = function($scope, $el, $attrs) {
        // insert loading wrapper
        let loadingElm = $("<div>");
        $el.after(loadingElm);

        let currentLoading = null;

        // Event Handlers
        $el.on("click", function(event) {
            event.preventDefault();
            excludeClosedSprints  = !excludeClosedSprints;

            currentLoading = $loading()
                .target(loadingElm)
                .start();

            if (excludeClosedSprints) {
                return $rootscope.$broadcast("backlog:unload-closed-sprints");
            } else {
                return $rootscope.$broadcast("backlog:load-closed-sprints");
            }
        });

        $scope.$on("$destroy", () => $el.off());

        return $scope.$on("closed-sprints:reloaded", (ctx, sprints) => {
            let key;
            currentLoading.finish();

            if (sprints.length > 0) {
                key = "BACKLOG.SPRINTS.ACTION_HIDE_CLOSED_SPRINTS";
            } else {
                key = "BACKLOG.SPRINTS.ACTION_SHOW_CLOSED_SPRINTS";
            }

            let text = $translate.instant(key);

            return $el.find(".text").text(text);
        });
    };

    return {link};
};

module.directive("tgBacklogToggleClosedSprintsVisualization", ["$rootScope", "$tgLoading", "$translate",
                                                               ToggleExcludeClosedSprintsVisualization]);
