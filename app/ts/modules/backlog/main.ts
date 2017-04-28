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
 * File: modules/backlog/main.coffee
 */

import * as angular from "angular";
import * as _ from "lodash";
import * as moment from "moment";
import {generateHash} from "../../app";
import {bindMethods, bindOnce, groupBy, scopeDefer, timeout, toggleText} from "../../libs/utils";
import {UsFiltersMixin} from "../controllerMixins";

//############################################################################
//# Backlog Controller
//############################################################################

export class BacklogController extends UsFiltersMixin {
    scope: angular.IScope;
    rootscope: angular.IScope;
    repo: any;
    confirm: any;
    rs: any;
    params: any;
    q: any;
    location: any;
    appMetaService: any;
    navUrls: any;
    events: any;
    analytics: any;
    translate: any;
    loading: any;
    rs2: any;
    modelTransform: any;
    errorHandlingService: any;
    storage: any;
    filterRemoteStorageService: any;
    projectService: any;
    storeCustomFiltersName: any;
    storeFiltersName: any;
    backlogOrder: any;
    milestonesOrder: any;
    page: any;
    disablePagination: any;
    firstLoadComplete: any;
    showTags: any;
    activeFilters: any;
    displayVelocity: any;
    forecastedStories: any;
    loadingUserstories: boolean;

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "tgAppMetaService",
            "$tgNavUrls",
            "$tgEvents",
            "$tgAnalytics",
            "$translate",
            "$tgLoading",
            "tgResources",
            "$tgQueueModelTransformation",
            "tgErrorHandlingService",
            "$tgStorage",
            "tgFilterRemoteStorageService",
            "tgProjectService",
        ];

        this.prototype.storeCustomFiltersName = "backlog-custom-filters";
        this.prototype.storeFiltersName = "backlog-filters";
        this.prototype.backlogOrder = {};
        this.prototype.milestonesOrder = {};
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, appMetaService, navUrls,
                events, analytics, translate, loading, rs2, modelTransform, errorHandlingService,
                storage, filterRemoteStorageService, projectService) {
        super();
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.events = events;
        this.analytics = analytics;
        this.translate = translate;
        this.loading = loading;
        this.rs2 = rs2;
        this.modelTransform = modelTransform;
        this.errorHandlingService = errorHandlingService;
        this.storage = storage;
        this.filterRemoteStorageService = filterRemoteStorageService;
        this.projectService = projectService;
        bindMethods(this);

        this.backlogOrder = {};
        this.milestonesOrder = {};

        this.page = 1;
        this.disablePagination = false;
        this.firstLoadComplete = false;
        this.scope.userstories = [];

        if (this.applyStoredFilters(this.params.pslug, "backlog-filters")) { return; }

        this.scope.sectionName = this.translate.instant("BACKLOG.SECTION_NAME");
        this.showTags = false;
        this.activeFilters = false;
        this.scope.showGraphPlaceholder = null;
        this.displayVelocity = false;

        this.initializeEventHandlers();

        const promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            this.firstLoadComplete = true;

            const title = this.translate.instant("BACKLOG.PAGE_TITLE", {projectName: this.scope.project.name});
            const description = this.translate.instant("BACKLOG.PAGE_DESCRIPTION", {
                projectName: this.scope.project.name,
                projectDescription: this.scope.project.description,
            });
            this.appMetaService.setAll(title, description);

            if (this.rs.userstories.getShowTags(this.scope.projectId)) {
                this.showTags = true;

                return this.scope.$broadcast("showTags", this.showTags);
            }
        });

        // On Error
        promise.then(null, this.onInitialDataError.bind(this));
    }

    filtersReloadContent() {
        return this.loadUserstories(true);
    }

    initializeEventHandlers() {
        this.scope.$on("usform:bulk:success", () => {
            this.loadUserstories(true);
            this.loadProjectStats();
            this.confirm.notify("success");
            return this.analytics.trackEvent("userstory", "create", "bulk create userstory on backlog", 1);
        });

        this.scope.$on("sprintform:create:success", (e, data, ussToMove) => {
            this.loadSprints().then(() => {
                return this.scope.$broadcast("sprintform:create:success:callback", ussToMove);
            });

            this.loadProjectStats();
            this.confirm.notify("success");
            return this.analytics.trackEvent("sprint", "create", "create sprint on backlog", 1);
        });

        this.scope.$on("usform:new:success", () => {
            this.loadUserstories(true);
            this.loadProjectStats();

            this.rootscope.$broadcast("filters:update");
            this.confirm.notify("success");
            return this.analytics.trackEvent("userstory", "create", "create userstory on backlog", 1);
        });

        this.scope.$on("sprintform:edit:success", () => {
            return this.loadProjectStats();
        });

        this.scope.$on("sprintform:remove:success", (event, sprint) => {
            this.loadSprints();
            this.loadProjectStats();
            this.loadUserstories(true);

            if (sprint.closed) {
                this.loadClosedSprints();
            }

            return this.rootscope.$broadcast("filters:update");
        });

        this.scope.$on("usform:edit:success", (event, data) => {
            const index = _.findIndex(this.scope.userstories, (us: any) => us.id === data.id);

            this.scope.userstories[index] = data;

            return this.rootscope.$broadcast("filters:update");
        });

        this.scope.$on("sprint:us:move", this.moveUs);
        this.scope.$on("sprint:us:moved", () => {
            this.loadSprints();
            return this.loadProjectStats();
        });

        this.scope.$on("backlog:load-closed-sprints", this.loadClosedSprints);
        return this.scope.$on("backlog:unload-closed-sprints", this.unloadClosedSprints);
    }

    initializeSubscription() {
        const routingKey1 = `changes.project.${this.scope.projectId}.userstories`;
        this.events.subscribe(this.scope, routingKey1, (message) => {
            this.loadAllPaginatedUserstories();
            return this.loadSprints();
        });

        const routingKey2 = `changes.project.${this.scope.projectId}.milestones`;
        return this.events.subscribe(this.scope, routingKey2, (message) => {
            return this.loadSprints();
        });
    }

    toggleShowTags() {
        return this.scope.$apply(() => {
            this.showTags = !this.showTags;
            return this.rs.userstories.storeShowTags(this.scope.projectId, this.showTags);
        });
    }

    toggleActiveFilters() {
        return this.activeFilters = !this.activeFilters;
    }

    toggleVelocityForecasting() {
        this.displayVelocity = !this.displayVelocity;
        if (!this.displayVelocity) {
            this.scope.visibleUserStories = _.map(this.scope.userstories, (it: any) => it.ref);
        } else {
            this.scope.visibleUserStories = _.map(this.forecastedStories, (it: any) => it.ref);
        }
        return scopeDefer(this.scope, () => {
            return this.scope.$broadcast("userstories:loaded");
        });
    }

    loadProjectStats() {
        return this.rs.projects.stats(this.scope.projectId).then((stats) => {
            this.scope.stats = stats;
            const totalPoints = stats.total_points ? stats.total_points : stats.defined_points;

            if (totalPoints) {
                this.scope.stats.completedPercentage = Math.round((100 * stats.closed_points) / totalPoints);
            } else {
                this.scope.stats.completedPercentage = 0;
            }

            this.scope.showGraphPlaceholder = !((stats.total_points != null) && (stats.total_milestones != null));
            this.calculateForecasting();
            return stats;
        });
    }

    setMilestonesOrder(sprints) {
        return sprints.map((sprint) =>
            ((this.milestonesOrder[sprint.id] = {}),
            sprint.user_stories.map((it) =>
                (this.milestonesOrder[sprint.id][it.id] = it.sprint_order))));
    }

    unloadClosedSprints() {
        return this.scope.$apply(() => {
            this.scope.closedSprints =  [];
            return this.rootscope.$broadcast("closed-sprints:reloaded", []);
        });
    }

    loadClosedSprints() {
        const params = {closed: true};
        return this.rs.sprints.list(this.scope.projectId, params).then((result) => {
            const sprints = result.milestones;

            this.setMilestonesOrder(sprints);

            this.scope.totalClosedMilestones = result.closed;

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in partials files
            for (const sprint of sprints) {
                sprint.user_stories = _.sortBy(sprint.user_stories, "sprint_order");
            }
            this.scope.closedSprints =  sprints;
            this.scope.closedSprintsById = groupBy(sprints, (x) => x.id);
            this.rootscope.$broadcast("closed-sprints:reloaded", sprints);
            return sprints;
        });
    }

    loadSprints() {
        const params = {closed: false};
        return this.rs.sprints.list(this.scope.projectId, params).then((result) => {
            const sprints = result.milestones;

            this.setMilestonesOrder(sprints);

            this.scope.totalMilestones = sprints;
            this.scope.totalClosedMilestones = result.closed;
            this.scope.totalOpenMilestones = result.open;
            this.scope.totalMilestones = this.scope.totalOpenMilestones + this.scope.totalClosedMilestones;

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in partials files
            for (const sprint of sprints) {
                sprint.user_stories = _.sortBy(sprint.user_stories, "sprint_order");
            }

            this.scope.sprints = sprints;

            if (!this.scope.closedSprints) { this.scope.closedSprints =  []; }

            this.scope.sprintsCounter = sprints.length;
            this.scope.sprintsById = groupBy(sprints, (x) => x.id);
            this.rootscope.$broadcast("sprints:loaded", sprints);

            this.scope.currentSprint = this.findCurrentSprint();

            return sprints;
        });
    }

    openSprints() {
        return _.filter(this.scope.sprints, (sprint: any) => !sprint.closed).reverse();
    }

    loadAllPaginatedUserstories() {
        const { page } = this;

        return this.loadUserstories(true, this.scope.userstories.length).then(() => {
          return this.page = page;
        });
    }

    loadUserstories(resetPagination= false, pageSize= null) {
        if (!this.scope.projectId) { return null; }

        this.loadingUserstories = true;
        this.disablePagination = true;
        const params = _.clone(this.location.search());
        this.rs.userstories.storeQueryParams(this.scope.projectId, params);

        if (resetPagination) {
            this.page = 1;
        }

        params.page = this.page;

        const promise = this.rs.userstories.listUnassigned(this.scope.projectId, params, pageSize);

        return promise.then((result) => {

            const userstories = result[0];
            const header = result[1];

            if (resetPagination) {
                this.scope.userstories = [];
            }

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in the partials files
            this.scope.userstories = this.scope.userstories.concat(_.sortBy(userstories, "backlog_order"));
            this.scope.visibleUserStories = _.map(this.scope.userstories, (it: any) => it.ref);

            for (const it of this.scope.userstories) {
                this.backlogOrder[it.id] = it.backlog_order;
            }

            this.loadingUserstories = false;

            if (header("x-pagination-next")) {
                this.disablePagination = false;
                this.page++;
            }

            // The broadcast must be executed when the DOM has been fully reloaded.
            // We can't assure when this exactly happens so we need a defer
            scopeDefer(this.scope, () => {
                return this.scope.$broadcast("userstories:loaded");
            });

            return userstories;
        });
    }

    loadBacklog() {
        return this.q.all([
            this.loadProjectStats(),
            this.loadSprints(),
            this.loadUserstories(),
        ]).then(this.calculateForecasting);
    }

    calculateForecasting() {
        const { stats } = this.scope;
        const { total_points } = stats;
        let current_sum = stats.assigned_points;
        let backlog_points_sum = 0;
        this.forecastedStories = [];

        return (() => {
            const result = [];
            for (const us of this.scope.userstories) {
                let item;
                current_sum += us.total_points;
                backlog_points_sum += us.total_points;
                this.forecastedStories.push(us);

                if ((stats.speed > 0) && (backlog_points_sum > stats.speed)) {
                    break;
                }
                result.push(item);
            }
            return result;
        })();
    }

    loadProject() {
        const project = this.projectService.project.toJS();

        if (!project.is_backlog_activated) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.closedMilestones = !!project.total_closed_milestones;
        this.scope.$emit("project:loaded", project);
        this.scope.points = _.sortBy(project.points, "order");
        this.scope.pointsById = groupBy(project.points, (x) => x.id);
        this.scope.usStatusById = groupBy(project.us_statuses, (x) => x.id);
        this.scope.usStatusList = _.sortBy(project.us_statuses, "id");

        return project;
    }

    loadInitialData() {
        const project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        this.initializeSubscription();

        return this.loadBacklog()
            .then(() => this.generateFilters())
            .then(() => this.scope.$emit("backlog:loaded"));
    }

    prepareBulkUpdateData(uses, field) {
         if (field == null) { field = "backlog_order"; }
         return _.map(uses, (x: any) => ({us_id: x.id, order: x[field]}));
     }

    // --move us api behavior--
    // If your are moving multiples USs you must use the bulk api
    // If there is only one US you must use patch (repo.save)
    //
    // The new US position is the position of the previous US + 1.
    // If the previous US has a position value that it is equal to
    // other USs, you must send all the USs with that position value
    // only if they are before of the target position with this USs
    // if it's a patch you must add them to the header, if is a bulk
    // you must send them with the other USs
    moveUs(ctx, usList, newUsIndex, newSprintId) {
        let afterDestination, beforeDestination, data, it, key, newSprint, promise, sprint, startIndex, us;
        const oldSprintId = usList[0].milestone;
        const { project } = usList[0];

        if (oldSprintId) {
            sprint = this.scope.sprintsById[oldSprintId] || this.scope.closedSprintsById[oldSprintId];
        }

        if (newSprintId) {
            newSprint = this.scope.sprintsById[newSprintId] || this.scope.closedSprintsById[newSprintId];
        }

        const currentSprintId = newSprintId !== oldSprintId ? newSprintId : oldSprintId;

        let orderList = null;
        let orderField = "";

        if (newSprintId !== oldSprintId) {
            if (newSprintId === null) { // From sprint to backlog
                for (key = 0; key < usList.length; key++) { // delete from sprint userstories
                    us = usList[key];
                    _.remove(sprint.user_stories, (it: any) => it.id === us.id);
                }

                orderField = "backlog_order";
                orderList = this.backlogOrder;

                beforeDestination = _.slice(this.scope.userstories, 0, newUsIndex);
                afterDestination = _.slice(this.scope.userstories, newUsIndex);

                this.scope.userstories = this.scope.userstories.concat(usList);
            } else { // From backlog to sprint
                for (us of usList) { // delete from sprint userstories
                    _.remove(this.scope.userstories, (it: any) => it.id === us.id);
                }

                orderField = "sprint_order";
                orderList = this.milestonesOrder[newSprint.id];

                beforeDestination = _.slice(newSprint.user_stories, 0, newUsIndex);
                afterDestination = _.slice(newSprint.user_stories, newUsIndex);

                newSprint.user_stories = newSprint.user_stories.concat(usList);
            }
        } else {
            let list;
            if (oldSprintId === null) { // backlog
                orderField = "backlog_order";
                orderList = this.backlogOrder;

                list = _.filter(this.scope.userstories, (listIt: any) => // Remove moved US from list
                    !_.find(usList, (moveIt: any) => listIt.id === moveIt.id),
                );

                beforeDestination = _.slice(list, 0, newUsIndex);
                afterDestination = _.slice(list, newUsIndex);
            } else { // sprint
                orderField = "sprint_order";
                orderList = this.milestonesOrder[sprint.id];

                list = _.filter(newSprint.user_stories, (listIt: any) => // Remove moved US from list
                    !_.find(usList, (moveIt: any) => listIt.id === moveIt.id),
                );

                beforeDestination = _.slice(list, 0, newUsIndex);
                afterDestination = _.slice(list, newUsIndex);
            }
        }

        // previous us
        const previous = beforeDestination[beforeDestination.length - 1];

        // this will store the previous us with the same position
        let setPreviousOrders = [];

        if (!previous) {
            startIndex = 0;
        } else if (previous) {
            startIndex = orderList[previous.id] + 1;

            const previousWithTheSameOrder = _.filter(beforeDestination, (it) => it[orderField] === orderList[previous.id]);

            // we must send the USs previous to the dropped USs to tell the backend
            // which USs are before the dropped USs, if they have the same value to
            // order, the backend doens't know after which one do you want to drop
            // the USs
            if (previousWithTheSameOrder.length > 1) {
                setPreviousOrders = _.map(previousWithTheSameOrder, (it: any) => ({us_id: it.id, order: orderList[it.id]}));
            }
        }

        const modifiedUs = [];

        for (key = 0; key < usList.length; key++) { // update sprint and new position
            us = usList[key];
            us.milestone = currentSprintId;
            us[orderField] = startIndex + key;
            orderList[us.id] = us[orderField];

            modifiedUs.push({us_id: us.id, order: us[orderField]});
        }

        startIndex = orderList[usList[usList.length - 1].id];

        for (key = 0; key < afterDestination.length; key++) { // increase position of the us after the dragged us's
            it = afterDestination[key];
            orderList[it.id] = startIndex + key + 1;
        }

        // refresh order
        this.scope.userstories = _.sortBy(this.scope.userstories, (it: any) => this.backlogOrder[it.id]);
        this.scope.visibleUserStories = _.map(this.scope.userstories, (it: any) => it.ref);

        for (sprint of this.scope.sprints) {
            sprint.user_stories = _.sortBy(sprint.user_stories, (it: any) => this.milestonesOrder[sprint.id][it.id]);
        }

        for (sprint of this.scope.closedSprints) {
            sprint.user_stories = _.sortBy(sprint.user_stories, (it: any) => this.milestonesOrder[sprint.id][it.id]);
        }

        // saving
        if ((usList.length > 1) && (newSprintId !== oldSprintId)) { // drag multiple to sprint
            data = modifiedUs.concat(setPreviousOrders);
            promise = this.rs.userstories.bulkUpdateMilestone(project, newSprintId, data);
        } else if (usList.length > 1) { // drag multiple in backlog
            data = modifiedUs.concat(setPreviousOrders);
            promise = this.rs.userstories.bulkUpdateBacklogOrder(project, data);
        } else {  // drag single
            const setOrders = {};
            for (it of setPreviousOrders) {
                setOrders[it.us_id] = it.order;
            }

            const options = {
                headers: {
                    "set-orders": JSON.stringify(setOrders),
                },
            };

            promise = this.repo.save(usList[0], true, {}, options, true);
        }

        promise.then(() => {
            this.rootscope.$broadcast("sprint:us:moved");

            if (this.scope.closedSprintsById && this.scope.closedSprintsById[oldSprintId]) {
                return this.rootscope.$broadcast("backlog:load-closed-sprints");
            }
        });

        return promise;
    }

    //# Template actions

    updateUserStoryStatus() {
        return this.generateFilters().then(() => {
            this.rootscope.$broadcast("filters:update");
            return this.loadProjectStats();
        });
    }

    editUserStory(projectId, ref, $event) {
        const target = $($event.target);

        const currentLoading = this.loading()
            .target(target)
            .removeClasses("edit-story")
            .timeout(200)
            .start();

        return this.rs.userstories.getByRef(projectId, ref).then((us) => {
            return this.rs2.attachments.list("us", us.id, projectId).then((attachments) => {
                this.rootscope.$broadcast("usform:edit", us, attachments.toJS());
                return currentLoading.finish();
            });
        });
    }

    deleteUserStory(us) {
        const title = this.translate.instant("US.TITLE_DELETE_ACTION");

        const message = us.subject;

        return this.confirm.askOnDelete(title, message).then((askResponse) => {
            // We modify the userstories in scope so the user doesn't see the removed US for a while
            this.scope.userstories = _.without(this.scope.userstories, us);
            const promise = this.repo.remove(us);
            promise.then(() => {
                askResponse.finish();

                return this.q.all([
                    this.loadProjectStats(),
                    this.loadSprints(),
                ]);
            });
            return promise.then(null, () => {
                askResponse.finish(false);
                return this.confirm.notify("error");
            });
        });
    }

    addNewUs(type) {
        switch (type) {
            case "standard": return this.rootscope.$broadcast("usform:new", this.scope.projectId,
                                                       this.scope.project.default_us_status, this.scope.usStatusList);
            case "bulk": return this.rootscope.$broadcast("usform:bulk", this.scope.projectId,
                                                   this.scope.project.default_us_status);
        }
    }

    addNewSprint() {
        return this.rootscope.$broadcast("sprintform:create", this.scope.projectId);
    }

    findCurrentSprint() {
      const currentDate = new Date().getTime();

      return  _.find(this.scope.sprints, function(sprint: any) {
          const start: any = moment(sprint.estimated_start, "YYYY-MM-DD").format("x");
          const end: any = moment(sprint.estimated_finish, "YYYY-MM-DD").format("x");

          return (currentDate >= start) && (currentDate <= end);
      });
  }
}
BacklogController.initClass();

//############################################################################
//# Backlog Directive
//############################################################################

export let BacklogDirective = function($repo, $rootscope, $translate, $rs) {
    //# Doom line Link
    const doomLineTemplate = _.template(`\
<div class="doom-line"><span><%- text %></span></div>\
`);

    const linkDoomLine = function($scope, $el, $attrs, $ctrl) {
        const reloadDoomLine = function() {
            if ($scope.displayVelocity) {
                removeDoomlineDom();
            }

            if (($scope.stats != null) && ($scope.stats.total_points != null) && ($scope.stats.total_points !== 0) && ($scope.displayVelocity == null)) {
                removeDoomlineDom();

                const { stats } = $scope;
                const { total_points } = stats;
                let current_sum = stats.assigned_points;

                if (!$scope.userstories) { return; }

                return (() => {
                    const result = [];
                    for (let i = 0; i < $scope.userstories.length; i++) {
                        const us = $scope.userstories[i];
                        let item;
                        current_sum += us.total_points;

                        if (current_sum > total_points) {
                            const domElement = $el.find(".backlog-table-body .us-item-row")[i];
                            addDoomLineDom(domElement);

                            break;
                        }
                        result.push(item);
                    }
                    return result;
                })();
            }
        };

        const removeDoomlineDom = () => $el.find(".doom-line").remove();

        const addDoomLineDom = function(element) {
            const text = $translate.instant("BACKLOG.DOOMLINE");
            return $(element).before(doomLineTemplate({text}));
        };

        const getUsItems = function() {
            const rowElements = $el.find(".backlog-table-body .us-item-row");
            return _.map(rowElements, (x) => angular.element(x));
        };

        $scope.$on("userstories:loaded", reloadDoomLine);
        $scope.$on("userstories:forecast", removeDoomlineDom);
        return $scope.$watch("stats", reloadDoomLine);
    };

    //# Move to current sprint link

    const linkToolbar = function($scope, $el, $attrs, $ctrl) {
        let ussToMove;
        const getUsToMove = function() {
            // Calculating the us's to be modified
            const ussDom = $el.find(".backlog-table-body input:checkbox:checked");

            return _.map(ussDom, function(item: any) {
                item =  $(item).closest(".tg-scope");
                const itemScope = item.scope();
                itemScope.us.milestone = $scope.sprints[0].id;
                return itemScope.us;
            });
        };

        const moveUssToSprint = function(selectedUss, sprint) {
            const ussCurrent = _($scope.userstories);

            // Remove them from backlog
            $scope.userstories = ussCurrent.without.apply(ussCurrent, selectedUss).value();

            const extraPoints = _.map(selectedUss, (v: any, k: any) => v.total_points);
            const totalExtraPoints =  _.reduce(extraPoints, (acc, num) => acc + num);

            // Add them to current sprint
            sprint.user_stories = _.union(sprint.user_stories, selectedUss);

            // Update the total of points
            sprint.total_points += totalExtraPoints;

            const data = _.map(selectedUss, (us: any) =>
                ({
                    us_id: us.id,
                    order: us.sprint_order,
                }),
        );
            $rs.userstories.bulkUpdateMilestone($scope.project.id, $scope.sprints[0].id, data).then(() => {
                $ctrl.loadSprints();
                $ctrl.loadProjectStats();
                $ctrl.toggleVelocityForecasting();
                return $ctrl.calculateForecasting();
            });

            return $el.find(".move-to-sprint").hide();
        };

        const moveToCurrentSprint = (selectedUss) => moveUssToSprint(selectedUss, $scope.currentSprint);

        const moveToLatestSprint = (selectedUss) => moveUssToSprint(selectedUss, $scope.sprints[0]);

        $scope.$on("sprintform:create:success:callback", (e, ussToMove) => _.partial(moveToCurrentSprint, ussToMove)());

        let shiftPressed = false;
        let lastChecked = null;

        const checkSelected = function(target) {
            lastChecked = target.closest(".us-item-row");
            target.closest(".us-item-row").toggleClass("ui-multisortable-multiple");
            const moveToSprintDom = $el.find(".move-to-sprint");
            const selectedUsDom = $el.find(".backlog-table-body input:checkbox:checked");

            if ((selectedUsDom.length > 0) && ($scope.sprints.length > 0)) {
                return moveToSprintDom.show();
            } else {
                return moveToSprintDom.hide();
            }
        };

        $(window).on("keydown.shift-pressed keyup.shift-pressed", function(event) {
            shiftPressed = !!event.shiftKey;

            return true;
        });

        // Enable move to current sprint only when there are selected us's
        $el.on("change", ".backlog-table-body input:checkbox", function(event) {
            // check elements between the last two if shift is pressed
            if (lastChecked && shiftPressed) {
                let elements = [];
                const current = $(event.currentTarget).closest(".us-item-row");
                const nextAll = lastChecked.nextAll();
                const prevAll = lastChecked.prevAll();

                if (_.some(nextAll, (next) => next === current[0])) {
                    elements = lastChecked.nextUntil(current);
                } else if (_.some(prevAll, (prev) => prev === current[0])) {
                    elements = lastChecked.prevUntil(current);
                }

                _.map(elements, function(elm) {
                    const input = $(elm).find("input:checkbox");
                    input.prop("checked", true);
                    return checkSelected(input);
                });
            }

            const target = angular.element(event.currentTarget);
            target.closest(".us-item-row").toggleClass("is-checked");
            return checkSelected(target);
        });

        $el.on("click", "#move-to-latest-sprint", (event) => {
            ussToMove = getUsToMove();

            return $scope.$apply(_.partial(moveToLatestSprint, ussToMove));
        });

        $el.on("click", "#move-to-current-sprint", (event) => {
            ussToMove = getUsToMove();

            return $scope.$apply(_.partial(moveToCurrentSprint, ussToMove));
        });

        $el.on("click", "#show-tags", function(event) {
            event.preventDefault();

            $ctrl.toggleShowTags();

            return showHideTags($ctrl);
        });

        return $el.on("click", ".forecasting-add-sprint", function(event) {
            const ussToMoveList = $ctrl.forecastedStories;
            if ($scope.currentSprint) {
                ussToMove = _.map(ussToMoveList, function(us: any, index: any) {
                    us.milestone = $scope.currentSprint.id;
                    us.order = index;
                    return us;
                });

                return $scope.$apply(_.partial(moveToCurrentSprint, ussToMove));
            } else {
                ussToMove = _.map(ussToMoveList, function(us: any, index: any) {
                    us.order = index;
                    return us;
                });

                return $rootscope.$broadcast("sprintform:create", $scope.projectId, ussToMove);
            }
        });
    };

    const showHideTags = function($ctrl) {
        let text;
        const elm = angular.element("#show-tags");

        if ($ctrl.showTags) {
            elm.addClass("active");

            text = $translate.instant("BACKLOG.TAGS.HIDE");
            return elm.text(text);
        } else {
            elm.removeClass("active");

            text = $translate.instant("BACKLOG.TAGS.SHOW");
            return elm.text(text);
        }
    };

    const openFilterInit = function($scope, $el, $ctrl) {
        const sidebar = $el.find("sidebar.backlog-filter");

        sidebar.addClass("active");

        return $ctrl.activeFilters = true;
    };

    const showHideFilter = function($scope, $el, $ctrl) {
        const sidebar = $el.find("sidebar.backlog-filter");
        sidebar.one("transitionend", () =>
            timeout(150, function() {
                $rootscope.$broadcast("resize");
                return $(".burndown").css("visibility", "visible");
            }),
        );

        const target = angular.element("#show-filters-button");
        $(".burndown").css("visibility", "hidden");
        sidebar.toggleClass("active");
        target.toggleClass("active");

        const hideText = $translate.instant("BACKLOG.FILTERS.HIDE");
        const showText = $translate.instant("BACKLOG.FILTERS.SHOW");

        toggleText(target, [hideText, showText]);

        return $ctrl.toggleActiveFilters();
    };

    //# Filters Link

    const linkFilters = function($scope, $el, $attrs, $ctrl) {
        $scope.filtersSearch = {};
        return $el.on("click", "#show-filters-button", function(event) {
            event.preventDefault();
            return $scope.$apply(() => showHideFilter($scope, $el, $ctrl));
        });
    };

    const link = function($scope, $el, $attrs, $rootscope) {
        const $ctrl = $el.controller();

        linkToolbar($scope, $el, $attrs, $ctrl);
        linkFilters($scope, $el, $attrs, $ctrl);
        linkDoomLine($scope, $el, $attrs, $ctrl);

        const filters = $ctrl.location.search();
        if (filters.status ||
           filters.tags ||
           filters.q ||
           filters.assigned_to ||
           filters.owner) {
            openFilterInit($scope, $el, $ctrl);
        }

        $scope.$on("showTags", () => showHideTags($ctrl));

        return $scope.$on("$destroy", function() {
            $el.off();
            return $(window).off(".shift-pressed");
        });
    };

    return {link};
};

//############################################################################
//# User story points directive
//############################################################################

export let UsRolePointsSelectorDirective = function($rootscope, $template, $compile, $translate) {
    const selectionTemplate = $template.get("backlog/us-role-points-popover.html", true);

    const link = function($scope, $el, $attrs) {
        // Watchers
        bindOnce($scope, "project", function(project) {
            const roles = _.filter(project.roles, "computable");
            const numberOfRoles = _.size(roles);

            if (numberOfRoles > 1) {
                return $el.append($compile(selectionTemplate({roles}))($scope));
            } else {
                $el.find(".icon-arrow-down").remove();
                return $el.find(".header-points").addClass("not-clickable");
            }
        });

        $scope.$on("uspoints:select", function(ctx, roleId, roleName) {
            $el.find(".popover").popover().close();
            return $el.find(".header-points").html(`${roleName}/<span>Total</span>`);
        });

        $scope.$on("uspoints:clear-selection", function(ctx, roleId) {
            $el.find(".popover").popover().close();

            const text = $translate.instant("COMMON.FIELDS.POINTS");
            return $el.find(".header-points").text(text);
        });

        // Dom Event Handlers
        $el.on("click", function(event) {
            const target = angular.element(event.target);

            if (target.is("span") || target.is("div")) {
                event.stopPropagation();
            }

            return $el.find(".popover").popover().open();
        });

        $el.on("click", ".clear-selection", function(event) {
            event.preventDefault();
            event.stopPropagation();
            return $rootscope.$broadcast("uspoints:clear-selection");
        });

        $el.on("click", ".role", function(event) {
            event.preventDefault();
            event.stopPropagation();
            const target = angular.element(event.currentTarget);
            const rolScope = target.scope();
            return $rootscope.$broadcast("uspoints:select", target.data("role-id"), target.text());
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

export let UsPointsDirective = function($tgEstimationsService, $repo, $tgTemplate) {
    const rolesTemplate = $tgTemplate.get("common/estimation/us-points-roles-popover.html", true);

    const link = function($scope, $el, $attrs) {
        const $ctrl = $el.controller();
        let updatingSelectedRoleId = null;
        let selectedRoleId = null;
        const filteringRoleId = null;
        let estimationProcess = null;

        $scope.$on("uspoints:select", function(ctx, roleId, roleName) {
            const us = $scope.$eval($attrs.tgBacklogUsPoints);
            selectedRoleId = roleId;
            return estimationProcess.render();
        });

        $scope.$on("uspoints:clear-selection", function(ctx) {
            const us = $scope.$eval($attrs.tgBacklogUsPoints);
            selectedRoleId = null;
            return estimationProcess.render();
        });

        $scope.$watch($attrs.tgBacklogUsPoints, function(us) {
            if (us) {
                estimationProcess = $tgEstimationsService.create($el, us, $scope.project);

                // Update roles
                const roles = estimationProcess.calculateRoles();
                if (roles.length === 0) {
                    $el.find(".icon-arrow-bottom").remove();
                    $el.find("a.us-points").addClass("not-clickable");

                } else if (roles.length === 1) {
                    // Preselect the role if we have only one
                    selectedRoleId = _.keys(us.points)[0];
                }

                if (estimationProcess.isEditable) {
                    bindClickElements();
                }

                estimationProcess.onSelectedPointForRole = function(roleId, pointId, points) {
                    us.points = points;
                    estimationProcess.render();

                    return this.save(roleId, pointId).then(() => $ctrl.loadProjectStats());
                };

                estimationProcess.render = function() {
                    let text, title;
                    const totalPoints = this.calculateTotalPoints();
                    if ((selectedRoleId == null) || (roles.length === 1)) {
                        text = totalPoints;
                        title = totalPoints;
                    } else {
                        const pointId = this.us.points[selectedRoleId];
                        const pointObj = this.pointsById[pointId];
                        text = `${pointObj.name} / <span>${totalPoints}</span>`;
                        title = `${pointObj.name} / ${totalPoints}`;
                    }

                    const ctx = {
                        totalPoints,
                        roles: this.calculateRoles(),
                        editable: this.isEditable,
                        text,
                        title,
                    };
                    const mainTemplate = "common/estimation/us-estimation-total.html";
                    const template = $tgTemplate.get(mainTemplate, true);
                    const html = template(ctx);
                    return this.$el.html(html);
                };

                return estimationProcess.render();
            }
        });

        const renderRolesSelector = function() {
            const roles = estimationProcess.calculateRoles();
            const html = rolesTemplate({roles});
            // Render into DOM and show the new created element
            $el.append(html);
            return $el.find(".pop-role").popover().open(function() { return $(this).remove(); });
        };

        const bindClickElements = function() {
            $el.on("click", "a.us-points", function(event) {
                event.preventDefault();
                event.stopPropagation();
                const us = $scope.$eval($attrs.tgBacklogUsPoints);
                updatingSelectedRoleId = selectedRoleId;
                if (selectedRoleId != null) {
                    return estimationProcess.renderPointsSelector(selectedRoleId);
                } else {
                    return renderRolesSelector();
                }
            });

            return $el.on("click", ".role", function(event) {
                event.preventDefault();
                event.stopPropagation();
                const target = angular.element(event.currentTarget);
                const us = $scope.$eval($attrs.tgBacklogUsPoints);
                updatingSelectedRoleId = target.data("role-id");
                const popRolesDom = $el.find(".pop-role");
                popRolesDom.find("a").removeClass("active");
                popRolesDom.find(`a[data-role-id='${updatingSelectedRoleId}']`).addClass("active");
                return estimationProcess.renderPointsSelector(updatingSelectedRoleId);
            });
        };

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Burndown graph directive
//############################################################################
export let ToggleBurndownVisibility = function($storage) {
    const hide = function() {
        $(".js-burndown-graph").removeClass("shown");
        $(".js-toggle-burndown-visibility-button").removeClass("active");
        return $(".js-burndown-graph").removeClass("open");
    };

    const show = function(firstLoad) {
        $(".js-toggle-burndown-visibility-button").addClass("active");

        if (firstLoad) {
            return $(".js-burndown-graph").addClass("shown");
        } else {
            return $(".js-burndown-graph").addClass("open");
        }
    };

    const link = function($scope, $el, $attrs) {
        let firstLoad = true;
        const hash = generateHash(["is-burndown-grpahs-collapsed"]);
        $scope.isBurndownGraphCollapsed = $storage.get(hash) || false;

        const toggleGraph = function() {
            if ($scope.isBurndownGraphCollapsed) {
                hide();
            } else {
                show(firstLoad);
            }

            return firstLoad = false;
        };

        $scope.$watch("showGraphPlaceholder", function() {
            if ($scope.showGraphPlaceholder != null) {
                $scope.isBurndownGraphCollapsed = $scope.isBurndownGraphCollapsed || $scope.showGraphPlaceholder;
                return toggleGraph();
            }
        });

        $el.on("click", ".js-toggle-burndown-visibility-button", function() {
            $scope.isBurndownGraphCollapsed = !$scope.isBurndownGraphCollapsed;
            $storage.set(hash, $scope.isBurndownGraphCollapsed);
            return toggleGraph();
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
    };
};

//############################################################################
//# Burndown graph directive
//############################################################################

export let BurndownBacklogGraphDirective = function($translate) {
    const redrawChart = function(element, dataToDraw) {
        const width = element.width();
        element.height(width / 6);
        const milestonesRange = __range__(0, (dataToDraw.milestones.length - 1), true);
        const data = [];
        const zero_line = _.map(dataToDraw.milestones, (ml) => 0);
        data.push({
            data: _.zip(milestonesRange, zero_line),
            lines: {
                fillColor : "rgba(0,0,0,0)",
            },
            points: {
                show: false,
            },
        });
        const optimal_line = _.map(dataToDraw.milestones, (ml: any) => ml.optimal);
        data.push({
            data: _.zip(milestonesRange, optimal_line),
            lines: {
                fillColor : "rgba(120,120,120,0.2)",
            },
        });
        const evolution_line = _.filter(_.map(dataToDraw.milestones, (ml: any) => ml.evolution), (evolution) => evolution != null);
        data.push({
            data: _.zip(milestonesRange, evolution_line),
            lines: {
                fillColor : "rgba(102,153,51,0.3)",
            },
        });
        const client_increment_line = _.map(dataToDraw.milestones, (ml) => -ml["team-increment"] - ml["client-increment"]);
        data.push({
            data: _.zip(milestonesRange, client_increment_line),
            lines: {
                fillColor : "rgba(255,51,51,0.3)",
            },
        });
        const team_increment_line = _.map(dataToDraw.milestones, (ml) => -ml["team-increment"]);
        data.push({
            data: _.zip(milestonesRange, team_increment_line),
            lines: {
                fillColor : "rgba(153,51,51,0.3)",
            },
        });
        const colors = [
            "rgba(0,0,0,1)",
            "rgba(120,120,120,0.2)",
            "rgba(102,153,51,1)",
            "rgba(153,51,51,1)",
            "rgba(255,51,51,1)",
        ];

        const options = {
            grid: {
                borderWidth: { top: 0, right: 1, left: 0, bottom: 0 },
                borderColor: "#ccc",
                hoverable: true,
            },
            xaxis: {
                ticks: dataToDraw.milestones.length,
                axisLabel: $translate.instant("BACKLOG.CHART.XAXIS_LABEL"),
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5,
                tickFormatter(val, axis) { return ""; },
            },
            yaxis: {
                axisLabel: $translate.instant("BACKLOG.CHART.YAXIS_LABEL"),
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5,
            },
            series: {
                shadowSize: 0,
                lines: {
                    show: true,
                    fill: true,
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 4,
                    lineWidth: 2,
                },
            },
            colors,
            tooltip: true,
            tooltipOpts: {
                content(label, xval, yval, flotItem) {
                    let ctx;
                    if (flotItem.seriesIndex === 1) {
                        ctx = {sprintName: dataToDraw.milestones[xval].name, value: Math.abs(yval)};
                        return $translate.instant("BACKLOG.CHART.OPTIMAL", ctx);
                    } else if (flotItem.seriesIndex === 2) {
                        ctx = {sprintName: dataToDraw.milestones[xval].name, value: Math.abs(yval)};
                        return $translate.instant("BACKLOG.CHART.REAL", ctx);
                    } else if (flotItem.seriesIndex === 3) {
                        ctx = {sprintName: dataToDraw.milestones[xval].name, value: Math.abs(yval)};
                        return $translate.instant("BACKLOG.CHART.INCREMENT_CLIENT", ctx);
                    } else {
                        ctx = {sprintName: dataToDraw.milestones[xval].name, value: Math.abs(yval)};
                        return $translate.instant("BACKLOG.CHART.INCREMENT_TEAM", ctx);
                    }
                },
            },
        };

        element.empty();
        return element.plot(data, options).data("plot");
    };

    const link = function($scope, $el, $attrs) {
        const element = angular.element($el);

        $scope.$watch("stats", function(value) {
            if ($scope.stats != null) {
                redrawChart(element, $scope.stats);

                return $scope.$on("resize", () => redrawChart(element, $scope.stats));
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Backlog progress bar directive
//############################################################################

export let TgBacklogProgressBarDirective = function($template, $compile) {
    const template = $template.get("backlog/progress-bar.html", true);

    const render = function(scope, el, projectPointsPercentaje, closedPointsPercentaje) {
        let html = template({
            projectPointsPercentaje,
            closedPointsPercentaje,
        });
        html = $compile(html)(scope);
        return el.html(html);
    };

    const adjustPercentaje = function(percentage) {
        let adjusted = _.max([0 , percentage]);
        adjusted = _.min([100, adjusted]);
        return Math.round(adjusted);
    };

    const link = function($scope, $el, $attrs) {
        const element = angular.element($el);

        $scope.$watch($attrs.tgBacklogProgressBar, function(stats) {
            if (stats != null) {
                let closedPointsPercentaje, projectPointsPercentaje;
                const totalPoints = stats.total_points ? stats.total_points : stats.defined_points;
                const definedPoints = stats.defined_points;
                const closedPoints = stats.closed_points;
                if (definedPoints > totalPoints) {
                    projectPointsPercentaje = (totalPoints * 100) / definedPoints;
                    closedPointsPercentaje = (closedPoints * 100) / definedPoints;
                } else {
                    projectPointsPercentaje = 100;
                    closedPointsPercentaje = (closedPoints * 100) / totalPoints;
                }

                projectPointsPercentaje = adjustPercentaje(projectPointsPercentaje - 3);
                closedPointsPercentaje = adjustPercentaje(closedPointsPercentaje - 3);
                return render($scope, $el, projectPointsPercentaje, closedPointsPercentaje);
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

function __range__(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
