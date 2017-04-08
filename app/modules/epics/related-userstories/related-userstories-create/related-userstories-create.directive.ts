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
 * File: related-userstory-create.directive.coffee
 */

import * as angular from "angular"

let module = angular.module('taigaEpics');

let RelatedUserstoriesCreateDirective = function(lightboxService) {
    this.lightboxService = lightboxService;
    let link = function(scope, el, attrs, ctrl) {
        let newUserstoryForm = el.find(".new-user-story-form").checksley();
        let existingUserstoryForm = el.find(".existing-user-story-form").checksley();

        ctrl.validateNewUserstoryForm = () => {
            return newUserstoryForm.validate();
        };

        ctrl.setNewUserstoryFormErrors = errors => {
            return newUserstoryForm.setErrors(errors);
        };

        ctrl.validateExistingUserstoryForm = () => {
            return existingUserstoryForm.validate();
        };

        ctrl.setExistingUserstoryFormErrors = errors => {
            return existingUserstoryForm.setErrors(errors);
        };

        scope.showLightbox = selectedProjectId =>
            scope.selectProject(selectedProjectId).then(() => {
                return lightboxService.open(el.find(".lightbox-create-related-user-stories"));
            })
        ;

        scope.closeLightbox = function() {
            scope.selectedUserstory = null;
            scope.searchUserstory = "";
            scope.relatedUserstoriesText = "";
            return lightboxService.close(el.find(".lightbox-create-related-user-stories"));
        };

        scope.$watch('vm.project', function(project) {
            if (project != null) {
              return scope.selectedProject = project.get('id');
          }
        });

        scope.selectProject = function(selectedProjectId) {
            scope.selectedUserstory = null;
            scope.searchUserstory = "";
            return ctrl.selectProject(selectedProjectId);
        };

        return scope.onUpdateSearchUserstory = () => scope.selectedUserstory = null;
    };

    return {
        link,
        templateUrl:"epics/related-userstories/related-userstories-create/related-userstories-create.html",
        controller: "RelatedUserstoriesCreateCtrl",
        controllerAs: "vm",
        bindToController: true,
        scope: {
              showCreateRelatedUserstoriesLightbox: "=",
              project: "=",
              epic: "=",
              epicUserstories: "=",
              loadRelatedUserstories:"&"
        }

    };
};

RelatedUserstoriesCreateDirective.$inject = ["lightboxService",];

module.directive("tgRelatedUserstoriesCreate", RelatedUserstoriesCreateDirective);
