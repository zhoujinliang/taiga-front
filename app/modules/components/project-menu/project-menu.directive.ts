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
 * File: project-menu.directive.coffee
 */

import * as angular from "angular"

let ProjectMenuDirective = function(projectService, lightboxFactory) {
    let link = function(scope, el, attrs, ctrl) {
        let projectChange = function() {
            if (projectService.project) {
                return ctrl.show();
            } else {
                return ctrl.hide();
            }
        };

        scope.$watch(( () => projectService.project), projectChange);

        scope.vm.fixed = false;
        return $(window).on("scroll", function() {
            let position = $(window).scrollTop();
            if ((position > 100) && (scope.vm.fixed === false)) {
                scope.vm.fixed = true;
                return scope.$digest();
            } else if ((position < 100) && (scope.vm.fixed === true)) {
                scope.vm.fixed = false;
                return scope.$digest();
            }
        });
    };

    return {
        scope: {},
        controller: "ProjectMenu",
        controllerAs: "vm",
        templateUrl: "components/project-menu/project-menu.html",
        link
    };
};

ProjectMenuDirective.$inject = [
    "tgProjectService",
    "tgLightboxFactory"
];

angular.module("taigaComponents").directive("tgProjectMenu", ProjectMenuDirective);
