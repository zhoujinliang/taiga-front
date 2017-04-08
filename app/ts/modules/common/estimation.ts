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
 * File: modules/common/estimation.coffee
 */

import {groupBy} from "../../utils"
import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaCommon");

//############################################################################
//# User story estimation directive (for Lightboxes)
//############################################################################

let LbUsEstimationDirective = function($tgEstimationsService, $rootScope, $repo, $template, $compile) {
    // Display the points of a US and you can edit it.
    //
    // Example:
    //     tg-lb-us-estimation-progress-bar(ng-model="us")
    //
    // Requirements:
    //   - Us object (ng-model)
    //   - scope.project object

    let link = function($scope, $el, $attrs, $model) {
        $scope.$watch($attrs.ngModel, function(us) {
            if (us) {
                let estimationProcess = $tgEstimationsService.create($el, us, $scope.project);
                estimationProcess.onSelectedPointForRole = function(roleId, pointId, points) {
                    us.points = points;
                    estimationProcess.render();

                    return $scope.$apply(() => $model.$setViewValue(us));
                };

                estimationProcess.render = function() {
                    let ctx = {
                        totalPoints: this.calculateTotalPoints(),
                        roles: this.calculateRoles(),
                        editable: this.isEditable,
                        loading: false
                    };
                    let mainTemplate = "common/estimation/us-estimation-points-per-role.html";
                    let template = $template.get(mainTemplate, true);
                    let html = template(ctx);
                    html = $compile(html)($scope);
                    return this.$el.html(html);
                };

                return estimationProcess.render();
            }
        });
        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgLbUsEstimation", ["$tgEstimationsService", "$rootScope", "$tgRepo", "$tgTemplate",
                                      "$compile", LbUsEstimationDirective]);


//############################################################################
//# User story estimation directive
//############################################################################

let UsEstimationDirective = function($tgEstimationsService, $rootScope, $repo, $template, $compile, $modelTransform, $confirm) {
    // Display the points of a US and you can edit it.
    //
    // Example:
    //     tg-us-estimation-progress-bar(ng-model="us")
    //
    // Requirements:
    //   - Us object (ng-model)
    //   - scope.project object

    let link = function($scope, $el, $attrs, $model) {
        let save = function(points) {
            let transform = $modelTransform.save(us => {
                us.points = points;

                return us;
            });

            let onError = () => {
                return $confirm.notify("error");
            };

            return transform.then(null, onError);
        };

        $scope.$watchCollection(() => $model.$modelValue && $model.$modelValue.points
        , function() {
            let us = $model.$modelValue;
            if (us) {
                let estimationProcess = $tgEstimationsService.create($el, us, $scope.project);
                estimationProcess.onSelectedPointForRole = function(roleId, pointId, points) {
                    estimationProcess.loading = roleId;
                    estimationProcess.render();
                    return save(points).then(function() {
                        estimationProcess.loading = false;
                        $rootScope.$broadcast("object:updated");
                        return estimationProcess.render();
                    });
                };

                estimationProcess.render = function() {
                    let ctx = {
                        totalPoints: this.calculateTotalPoints(),
                        roles: this.calculateRoles(),
                        editable: this.isEditable,
                        loading: estimationProcess.loading
                    };
                    let mainTemplate = "common/estimation/us-estimation-points-per-role.html";
                    let template = $template.get(mainTemplate, true);
                    let html = template(ctx);
                    html = $compile(html)($scope);
                    return this.$el.html(html);
                };

                return estimationProcess.render();
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgUsEstimation", ["$tgEstimationsService", "$rootScope", "$tgRepo",
                                    "$tgTemplate", "$compile", "$tgQueueModelTransformation",
                                    "$tgConfirm", UsEstimationDirective]);


//############################################################################
//# Estimations service
//############################################################################

let EstimationsService = function($template, $repo, $confirm, $q, $qqueue) {
    let pointsTemplate = $template.get("common/estimation/us-estimation-points.html", true);

    class EstimationProcess {
        $el:any
        us:any
        project:any
        isEditable:any
        roles:any
        points:any
        loading:any
        pointsById:any
        onSelectedPointForRole:any
        render:any

        constructor($el, us, project) {
            this.bindClickEvents = this.bindClickEvents.bind(this);
            this.$el = $el;
            this.us = us;
            this.project = project;
            this.isEditable = this.project.my_permissions.indexOf("modify_us") !== -1;
            this.roles = this.project.roles;
            this.points = this.project.points;
            this.loading = false;
            this.pointsById = groupBy(this.points, x => x.id);
            this.onSelectedPointForRole =  function(roleId, pointId) {};
            this.render = function() {};
        }

        save(roleId, pointId) {
            let deferred = $q.defer();
            $qqueue.add(() => {
                let onSuccess = () => {
                    deferred.resolve();
                    return this.render();
                };

                let onError = () => {
                    $confirm.notify("error");
                    this.us.revert();
                    this.render();
                    return deferred.reject();
                };

                return $repo.save(this.us).then(onSuccess, onError);
            });

            return deferred.promise;
        }

        calculateTotalPoints() {
            let values = _.map(this.us.points, (v:number, k) => (this.pointsById[v] != null ? this.pointsById[v].value : undefined));

            if (values.length === 0) {
                return "?";
            }

            let notNullValues = _.filter(values, v => v != null);
            if (notNullValues.length === 0) {
                return "?";
            }

            return _.reduce(notNullValues, (acc, num) => acc + num);
        }

        calculateRoles() {
            let computableRoles = _.filter(this.project.roles, "computable");
            let roles = _.map(computableRoles, (role:any) => {
                let pointId = this.us.points[role.id];
                let pointObj = this.pointsById[pointId];
                role = _.cloneDeep(role);
                role.points = (pointObj != null) && (pointObj.name != null) ? pointObj.name : "?";
                return role;
            });

            return roles;
        }

        bindClickEvents() {
            let roleId, target;
            this.$el.on("click", ".total.clickable", event => {
                event.preventDefault();
                event.stopPropagation();
                target = angular.element(event.currentTarget);
                roleId = target.data("role-id");
                this.renderPointsSelector(roleId, target);
                target.siblings().removeClass('active');
                return target.addClass('active');
            });

            return this.$el.on("click", ".point", event => {
                event.preventDefault();
                event.stopPropagation();
                target = angular.element(event.currentTarget);
                roleId = target.data("role-id");
                let pointId = target.data("point-id");
                this.$el.find(".popover").popover().close();

                let points = _.cloneDeep(this.us.points);
                points[roleId] = pointId;

                return this.onSelectedPointForRole(roleId, pointId, points);
            });
        }

        renderPointsSelector(roleId, target) {
            let points = _.map(this.points, (point:any) => {
                point = _.cloneDeep(point);
                point.selected = this.us.points[roleId] === point.id ? false : true;
                return point;
            });

            let maxPointLength = 5;
            let horizontalList =  _.some(points, point => point.name.length > maxPointLength);

            let html = pointsTemplate({"points": points, roleId, horizontal: horizontalList});
            // Remove any previous state
            this.$el.find(".popover").popover().close();
            this.$el.find(".pop-points-open").remove();
            // Render into DOM and show the new created element
            if (target != null) {
                this.$el.find(target).append(html);
            } else {
                this.$el.append(html);
            }

            this.$el.find(".pop-points-open").popover().open(function() {
                return $(this)
                    .removeClass("active")
                    .closest("li").removeClass("active");
            });

            this.$el.find(".pop-points-open").show();

            let pop = this.$el.find(".pop-points-open");
            if ((pop.offset().top + pop.height()) > document.body.clientHeight) {
                return pop.addClass('pop-bottom');
            }
        }
    }

    let create = function($el, us, project) {
        $el.unbind("click");

        let estimationProcess = new EstimationProcess($el, us, project);

        if (estimationProcess.isEditable) {
            estimationProcess.bindClickEvents();
        }

        return estimationProcess;
    };

    return {
        create
    };
};

module.factory("$tgEstimationsService", ["$tgTemplate", "$tgRepo", "$tgConfirm",
                                         "$q", "$tgQqueue", EstimationsService]);
