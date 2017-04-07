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
 * File: project-logo-small-src.directive.coffee
 */

let ProjectLogoSmallSrcDirective = function(projectLogoService) {
    let link = (scope, el, attrs) =>
        scope.$watch('project', function(project) {
            project = Immutable.fromJS(project); // Necesary for old code

            if (!project) { return; }

            let projectLogo = project.get('logo_small_url');

            if (projectLogo) {
                el.attr('src', projectLogo);
                return el.css('background', "");
            } else {
                let logo = projectLogoService.getDefaultProjectLogo(project.get('slug'), project.get('id'));
                el.attr('src', logo.src);
                return el.css('background', logo.color);
            }
        })
    ;

    return {
        link,
        scope: {
             project: "=tgProjectLogoSmallSrc"
        }
    };
};

ProjectLogoSmallSrcDirective.$inject = [
    "tgProjectLogoService"
];

angular.module("taigaComponents").directive("tgProjectLogoSmallSrc", ProjectLogoSmallSrcDirective);
