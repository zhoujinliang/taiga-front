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
 * File: modules/backlog/lightboxes.coffee
 */

import { debounce } from "../../utils"
import * as angular from "angular"
import * as moment from "moment"
import * as _ from "lodash"

//############################################################################
//# Creare/Edit Sprint Lightbox Directive
//############################################################################

export let CreateEditSprint = function($repo, $confirm, $rs, $rootscope, lightboxService, $loading, $translate) {
    let link = function($scope, $el, attrs) {
        let estimated_start, newSprint, prettyDate;
        let hasErrors = false;
        let createSprint = true;
        let form = null;
        $scope.newSprint = {};
        let ussToAdd = null;

        let resetSprint = function() {
            if (form) { form.reset(); }

            return $scope.newSprint = {
                project: null,
                name: null,
                estimated_start: null,
                estimated_finish: null
            };
        };

        let submit = debounce(2000, event => {
            let promise;
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            prettyDate = $translate.instant("COMMON.PICKERDATE.FORMAT");

            let submitButton = $el.find(".submit-button");
            form = $el.find("form").checksley();

            if (!form.validate()) {
                hasErrors = true;
                $el.find(".last-sprint-name").addClass("disappear");
                return;
            }

            hasErrors = false;
            let broadcastEvent = null;

            estimated_start = $('.date-start').val();
            let estimated_end = $('.date-end').val();

            if (createSprint) {
                newSprint = angular.copy($scope.newSprint);
                newSprint.estimated_start = moment(estimated_start, prettyDate).format("YYYY-MM-DD");
                newSprint.estimated_finish = moment(estimated_end, prettyDate).format("YYYY-MM-DD");

                promise = $repo.create("milestones", newSprint);
                broadcastEvent = "sprintform:create:success";
            } else {
                newSprint = $scope.newSprint.realClone();
                newSprint.estimated_start =  moment(estimated_start, prettyDate).format("YYYY-MM-DD");
                newSprint.estimated_finish = moment(estimated_end, prettyDate).format("YYYY-MM-DD");

                promise = $repo.save(newSprint);
                broadcastEvent = "sprintform:edit:success";
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            promise.then(function(data) {
                currentLoading.finish();
                if (createSprint) { $scope.sprintsCounter += 1; }

                $scope.sprints = _.map($scope.sprints, function(it:any) {
                    if (it.id === data.id) {
                        return data;
                    } else {
                        return it;
                    }
                });

                if ((broadcastEvent === "sprintform:create:success") && ussToAdd) {
                    $rootscope.$broadcast(broadcastEvent, data, ussToAdd);
                } else {
                    $rootscope.$broadcast(broadcastEvent, data);
                }

                return lightboxService.close($el);
            });

            return promise.then(null, function(data) {
                currentLoading.finish();

                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("light-error", data._error_message);
                } else if (data.__all__) {
                    return $confirm.notify("light-error", data.__all__[0]);
                }
            });
        });

        let remove = function() {
            let title = $translate.instant("LIGHTBOX.DELETE_SPRINT.TITLE");
            let message = $scope.newSprint.name;

            return $confirm.askOnDelete(title, message).then(askResponse => {
                let onSuccess = function() {
                    askResponse.finish();
                    $scope.milestonesCounter -= 1;
                    lightboxService.close($el);
                    return $rootscope.$broadcast("sprintform:remove:success", $scope.newSprint);
                };

                let onError = function() {
                    askResponse.finish(false);
                    return $confirm.notify("error");
                };
                return $repo.remove($scope.newSprint).then(onSuccess, onError);
            });
        };

        let getLastSprint = function() {
            let openSprints = _.filter($scope.sprints, (sprint:any) => !sprint.closed);

            let sortedSprints = _.sortBy(openSprints, (sprint:any) => moment(sprint.estimated_finish, 'YYYY-MM-DD').format('X'));

            return sortedSprints[sortedSprints.length - 1];
        };

        $scope.$on("sprintform:create", function(event, projectId, uss) {
            let text;
            ussToAdd = uss;
            resetSprint();

            form = $el.find("form").checksley();
            form.reset();

            createSprint = true;
            prettyDate = $translate.instant("COMMON.PICKERDATE.FORMAT");
            $scope.newSprint.project = projectId;
            $scope.newSprint.name = null;
            $scope.newSprint.slug = null;

            let lastSprint = getLastSprint();

            let estimatedStart = moment();

            if (lastSprint) {
                estimatedStart = moment(lastSprint.estimated_finish);
            } else if ($scope.newSprint.estimated_start) {
                estimatedStart = moment($scope.newSprint.estimated_start);
            }

            $scope.newSprint.estimated_start = estimatedStart.format(prettyDate);

            let estimatedFinish = moment().add(2, "weeks");

            if (lastSprint) {
                estimatedFinish = moment(lastSprint.estimated_finish).add(2, "weeks");
            } else if ($scope.newSprint.estimated_finish) {
                estimatedFinish = moment($scope.newSprint.estimated_finish);
            }

            $scope.newSprint.estimated_finish = estimatedFinish.format(prettyDate);

            let lastSprintNameDom = $el.find(".last-sprint-name");
            if ((lastSprint != null ? lastSprint.name : undefined) != null) {
                text = $translate.instant("LIGHTBOX.ADD_EDIT_SPRINT.LAST_SPRINT_NAME", {
                            lastSprint: lastSprint.name});
                lastSprintNameDom.html(text);
            }

            $el.find(".delete-sprint").addClass("hidden");

            text = $translate.instant("LIGHTBOX.ADD_EDIT_SPRINT.TITLE");
            $el.find(".title").text(text);

            text = $translate.instant("COMMON.CREATE");
            $el.find(".button-green").text(text);

            lightboxService.open($el);
            $el.find(".sprint-name").focus();
            return $el.find(".last-sprint-name").removeClass("disappear");
         });

        $scope.$on("sprintform:edit", function(ctx, sprint) {
            resetSprint();

            createSprint = false;
            prettyDate = $translate.instant("COMMON.PICKERDATE.FORMAT");

            $scope.$apply(function() {
                $scope.newSprint = sprint.realClone();
                $scope.newSprint.estimated_start = moment($scope.newSprint.estimated_start).format(prettyDate);
                return $scope.newSprint.estimated_finish = moment($scope.newSprint.estimated_finish).format(prettyDate);
            });

            $el.find(".delete-sprint").removeClass("hidden");

            let editSprint = $translate.instant("BACKLOG.EDIT_SPRINT");
            $el.find(".title").text(editSprint);

            let save = $translate.instant("COMMON.SAVE");
            $el.find(".button-green").text(save);

            lightboxService.open($el);
            $el.find(".sprint-name").focus().select();
            return $el.find(".last-sprint-name").addClass("disappear");
        });

        $el.on("keyup", ".sprint-name", function(event) {
            if (($el.find(".sprint-name").val().length > 0) || hasErrors) {
                return $el.find(".last-sprint-name").addClass("disappear");
            } else {
                return $el.find(".last-sprint-name").removeClass("disappear");
            }
        });

        $el.on("submit", "form", submit);

        $el.on("click", ".delete-sprint", function(event) {
            event.preventDefault();
            return remove();
        });

        $scope.$on("$destroy", () => $el.off());

        return resetSprint();
    };

    return {link};
};
