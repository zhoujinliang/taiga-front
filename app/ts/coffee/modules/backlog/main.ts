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

let { taiga } = this;

let { mixOf } = this.taiga;
let { toggleText } = this.taiga;
let { scopeDefer } = this.taiga;
let { bindOnce } = this.taiga;
let { groupBy } = this.taiga;
let { timeout } = this.taiga;
let { bindMethods } = this.taiga;
let { generateHash } = this.taiga;

let module = angular.module("taigaBacklog");

//############################################################################
//# Backlog Controller
//############################################################################

class BacklogController extends mixOf(taiga.Controller, taiga.PageMixin, taiga.FiltersMixin, taiga.UsFiltersMixin) {
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
            "tgProjectService"
        ];
    
        this.prototype.storeCustomFiltersName = 'backlog-custom-filters';
        this.prototype.storeFiltersName = 'backlog-filters';
        this.prototype.backlogOrder = {};
        this.prototype.milestonesOrder = {};
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, appMetaService, navUrls,
                  events, analytics, translate, loading, rs2, modelTransform, errorHandlingService,
                  storage, filterRemoteStorageService, projectService) {
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

        let promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            this.firstLoadComplete = true;

            let title = this.translate.instant("BACKLOG.PAGE_TITLE", {projectName: this.scope.project.name});
            let description = this.translate.instant("BACKLOG.PAGE_DESCRIPTION", {
                projectName: this.scope.project.name,
                projectDescription: this.scope.project.description
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
            let index = _.findIndex(this.scope.userstories, us => us.id === data.id);

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
        let routingKey1 = `changes.project.${this.scope.projectId}.userstories`;
        this.events.subscribe(this.scope, routingKey1, message => {
            this.loadAllPaginatedUserstories();
            return this.loadSprints();
        });

        let routingKey2 = `changes.project.${this.scope.projectId}.milestones`;
        return this.events.subscribe(this.scope, routingKey2, message => {
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
            this.scope.visibleUserStories = _.map(this.scope.userstories, it => it.ref);
        } else {
            this.scope.visibleUserStories = _.map(this.forecastedStories, it => it.ref);
        }
        return scopeDefer(this.scope, () => {
            return this.scope.$broadcast("userstories:loaded");
        });
    }

    loadProjectStats() {
        return this.rs.projects.stats(this.scope.projectId).then(stats => {
            this.scope.stats = stats;
            let totalPoints = stats.total_points ? stats.total_points : stats.defined_points;

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
        return Array.from(sprints).map((sprint) =>
            ((this.milestonesOrder[sprint.id] = {}),
            Array.from(sprint.user_stories).map((it) =>
                (this.milestonesOrder[sprint.id][it.id] = it.sprint_order))));
    }

    unloadClosedSprints() {
        return this.scope.$apply(() => {
            this.scope.closedSprints =  [];
            return this.rootscope.$broadcast("closed-sprints:reloaded", []);
        });
    }

    loadClosedSprints() {
        let params = {closed: true};
        return this.rs.sprints.list(this.scope.projectId, params).then(result => {
            let sprints = result.milestones;

            this.setMilestonesOrder(sprints);

            this.scope.totalClosedMilestones = result.closed;

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in partials files
            for (let sprint of Array.from(sprints)) {
                sprint.user_stories = _.sortBy(sprint.user_stories, "sprint_order");
            }
            this.scope.closedSprints =  sprints;
            this.scope.closedSprintsById = groupBy(sprints, x => x.id);
            this.rootscope.$broadcast("closed-sprints:reloaded", sprints);
            return sprints;
        });
    }

    loadSprints() {
        let params = {closed: false};
        return this.rs.sprints.list(this.scope.projectId, params).then(result => {
            let sprints = result.milestones;

            this.setMilestonesOrder(sprints);

            this.scope.totalMilestones = sprints;
            this.scope.totalClosedMilestones = result.closed;
            this.scope.totalOpenMilestones = result.open;
            this.scope.totalMilestones = this.scope.totalOpenMilestones + this.scope.totalClosedMilestones;

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in partials files
            for (let sprint of Array.from(sprints)) {
                sprint.user_stories = _.sortBy(sprint.user_stories, "sprint_order");
            }

            this.scope.sprints = sprints;

            if (!this.scope.closedSprints) { this.scope.closedSprints =  []; }

            this.scope.sprintsCounter = sprints.length;
            this.scope.sprintsById = groupBy(sprints, x => x.id);
            this.rootscope.$broadcast("sprints:loaded", sprints);

            this.scope.currentSprint = this.findCurrentSprint();

            return sprints;
        });
    }

    openSprints() {
        return _.filter(this.scope.sprints, sprint => !sprint.closed).reverse();
    }

    loadAllPaginatedUserstories() {
        let { page } = this;

        return this.loadUserstories(true, this.scope.userstories.length).then(() => {
          return this.page = page;
        });
    }

    loadUserstories(resetPagination, pageSize) {
        if (resetPagination == null) { resetPagination = false; }
        if (!this.scope.projectId) { return null; }

        this.loadingUserstories = true;
        this.disablePagination = true;
        let params = _.clone(this.location.search());
        this.rs.userstories.storeQueryParams(this.scope.projectId, params);

        if (resetPagination) {
            this.page = 1;
        }

        params.page = this.page;

        let promise = this.rs.userstories.listUnassigned(this.scope.projectId, params, pageSize);

        return promise.then(result => {

            let userstories = result[0];
            let header = result[1];

            if (resetPagination) {
                this.scope.userstories = [];
            }

            // NOTE: Fix order of USs because the filter orderBy does not work propertly in the partials files
            this.scope.userstories = this.scope.userstories.concat(_.sortBy(userstories, "backlog_order"));
            this.scope.visibleUserStories = _.map(this.scope.userstories, it => it.ref);

            for (let it of Array.from(this.scope.userstories)) {
                this.backlogOrder[it.id] = it.backlog_order;
            }

            this.loadingUserstories = false;

            if (header('x-pagination-next')) {
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
            this.loadUserstories()
        ]).then(this.calculateForecasting);
    }

    calculateForecasting() {
        let { stats } = this.scope;
        let { total_points } = stats;
        let current_sum = stats.assigned_points;
        let backlog_points_sum = 0;
        this.forecastedStories = [];

        return (() => {
            let result = [];
            for (let us of Array.from(this.scope.userstories)) {
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
        let project = this.projectService.project.toJS();

        if (!project.is_backlog_activated) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.closedMilestones = !!project.total_closed_milestones;
        this.scope.$emit('project:loaded', project);
        this.scope.points = _.sortBy(project.points, "order");
        this.scope.pointsById = groupBy(project.points, x => x.id);
        this.scope.usStatusById = groupBy(project.us_statuses, x => x.id);
        this.scope.usStatusList = _.sortBy(project.us_statuses, "id");

        return project;
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        this.initializeSubscription();

        return this.loadBacklog()
            .then(() => this.generateFilters())
            .then(() => this.scope.$emit("backlog:loaded"));
    }

    prepareBulkUpdateData(uses, field) {
         if (field == null) { field = "backlog_order"; }
         return _.map(uses, x => ({"us_id": x.id, "order": x[field]}));
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
        let oldSprintId = usList[0].milestone;
        let { project } = usList[0];

        if (oldSprintId) {
            sprint = this.scope.sprintsById[oldSprintId] || this.scope.closedSprintsById[oldSprintId];
        }

        if (newSprintId) {
            newSprint = this.scope.sprintsById[newSprintId] || this.scope.closedSprintsById[newSprintId];
        }

        let currentSprintId = newSprintId !== oldSprintId ? newSprintId : oldSprintId;

        let orderList = null;
        let orderField = "";

        if (newSprintId !== oldSprintId) {
            if (newSprintId === null) { // From sprint to backlog
                for (key = 0; key < usList.length; key++) { // delete from sprint userstories
                    us = usList[key];
                    _.remove(sprint.user_stories, it => it.id === us.id);
                }

                orderField = "backlog_order";
                orderList = this.backlogOrder;

                beforeDestination = _.slice(this.scope.userstories, 0, newUsIndex);
                afterDestination = _.slice(this.scope.userstories, newUsIndex);

                this.scope.userstories = this.scope.userstories.concat(usList);
            } else { // From backlog to sprint
                for (us of Array.from(usList)) { // delete from sprint userstories
                    _.remove(this.scope.userstories, it => it.id === us.id);
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

                list = _.filter(this.scope.userstories, listIt => // Remove moved US from list
                    !_.find(usList, moveIt => listIt.id === moveIt.id)
                );

                beforeDestination = _.slice(list, 0, newUsIndex);
                afterDestination = _.slice(list, newUsIndex);
            } else { // sprint
                orderField = "sprint_order";
                orderList = this.milestonesOrder[sprint.id];

                list = _.filter(newSprint.user_stories, listIt => // Remove moved US from list
                    !_.find(usList, moveIt => listIt.id === moveIt.id)
                );

                beforeDestination = _.slice(list, 0, newUsIndex);
                afterDestination = _.slice(list, newUsIndex);
            }
        }

        // previous us
        let previous = beforeDestination[beforeDestination.length - 1];

        // this will store the previous us with the same position
        let setPreviousOrders = [];

        if (!previous) {
            startIndex = 0;
        } else if (previous) {
            startIndex = orderList[previous.id] + 1;

            let previousWithTheSameOrder = _.filter(beforeDestination, it => it[orderField] === orderList[previous.id]);

            // we must send the USs previous to the dropped USs to tell the backend
            // which USs are before the dropped USs, if they have the same value to
            // order, the backend doens't know after which one do you want to drop
            // the USs
            if (previousWithTheSameOrder.length > 1) {
                setPreviousOrders = _.map(previousWithTheSameOrder, it => ({us_id: it.id, order: orderList[it.id]}));
            }
        }

        let modifiedUs = [];

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
        this.scope.userstories = _.sortBy(this.scope.userstories, it => this.backlogOrder[it.id]);
        this.scope.visibleUserStories = _.map(this.scope.userstories, it => it.ref);

        for (sprint of Array.from(this.scope.sprints)) {
            sprint.user_stories = _.sortBy(sprint.user_stories, it => this.milestonesOrder[sprint.id][it.id]);
        }

        for (sprint of Array.from(this.scope.closedSprints)) {
            sprint.user_stories = _.sortBy(sprint.user_stories, it => this.milestonesOrder[sprint.id][it.id]);
        }

        // saving
        if ((usList.length > 1) && (newSprintId !== oldSprintId)) { // drag multiple to sprint
            data = modifiedUs.concat(setPreviousOrders);
            promise = this.rs.userstories.bulkUpdateMilestone(project, newSprintId, data);
        } else if (usList.length > 1) { // drag multiple in backlog
            data = modifiedUs.concat(setPreviousOrders);
            promise = this.rs.userstories.bulkUpdateBacklogOrder(project, data);
        } else {  // drag single
            let setOrders = {};
            for (it of Array.from(setPreviousOrders)) {
                setOrders[it.us_id] = it.order;
            }

            let options = {
                headers: {
                    "set-orders": JSON.stringify(setOrders)
                }
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
        let target = $($event.target);

        let currentLoading = this.loading()
            .target(target)
            .removeClasses("edit-story")
            .timeout(200)
            .start();

        return this.rs.userstories.getByRef(projectId, ref).then(us => {
            return this.rs2.attachments.list("us", us.id, projectId).then(attachments => {
                this.rootscope.$broadcast("usform:edit", us, attachments.toJS());
                return currentLoading.finish();
            });
        });
    }

    deleteUserStory(us) {
        let title = this.translate.instant("US.TITLE_DELETE_ACTION");

        let message = us.subject;

        return this.confirm.askOnDelete(title, message).then(askResponse => {
            // We modify the userstories in scope so the user doesn't see the removed US for a while
            this.scope.userstories = _.without(this.scope.userstories, us);
            let promise = this.repo.remove(us);
            promise.then(() => {
                askResponse.finish();

                return this.q.all([
                    this.loadProjectStats(),
                    this.loadSprints()
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
      let currentDate = new Date().getTime();

      return  _.find(this.scope.sprints, function(sprint) {
          let start = moment(sprint.estimated_start, 'YYYY-MM-DD').format('x');
          let end = moment(sprint.estimated_finish, 'YYYY-MM-DD').format('x');

          return (currentDate >= start) && (currentDate <= end);
      });
  }
}
BacklogController.initClass();

module.controller("BacklogController", BacklogController);

//############################################################################
//# Backlog Directive
//############################################################################

let BacklogDirective = function($repo, $rootscope, $translate, $rs) {
    //# Doom line Link
    let doomLineTemplate = _.template(`\
<div class="doom-line"><span><%- text %></span></div>\
`);

    let linkDoomLine = function($scope, $el, $attrs, $ctrl) {
        let reloadDoomLine = function() {
            if ($scope.displayVelocity) {
                removeDoomlineDom();
            }

            if (($scope.stats != null) && ($scope.stats.total_points != null) && ($scope.stats.total_points !== 0) && ($scope.displayVelocity == null)) {
                removeDoomlineDom();

                let { stats } = $scope;
                let { total_points } = stats;
                let current_sum = stats.assigned_points;

                if (!$scope.userstories) { return; }

                return (() => {
                    let result = [];
                    for (let i = 0; i < $scope.userstories.length; i++) {
                        let us = $scope.userstories[i];
                        let item;
                        current_sum += us.total_points;

                        if (current_sum > total_points) {
                            let domElement = $el.find('.backlog-table-body .us-item-row')[i];
                            addDoomLineDom(domElement);

                            break;
                        }
                        result.push(item);
                    }
                    return result;
                })();
            }
        };

        var removeDoomlineDom = () => $el.find(".doom-line").remove();

        var addDoomLineDom = function(element) {
            let text = $translate.instant("BACKLOG.DOOMLINE");
            return $(element).before(doomLineTemplate({"text": text}));
        };

        let getUsItems = function() {
            let rowElements = $el.find('.backlog-table-body .us-item-row');
            return _.map(rowElements, x => angular.element(x));
        };

        $scope.$on("userstories:loaded", reloadDoomLine);
        $scope.$on("userstories:forecast", removeDoomlineDom);
        return $scope.$watch("stats", reloadDoomLine);
    };

    //# Move to current sprint link

    let linkToolbar = function($scope, $el, $attrs, $ctrl) {
        let ussToMove;
        let getUsToMove = function() {
            // Calculating the us's to be modified
            let ussDom = $el.find(".backlog-table-body input:checkbox:checked");

            return _.map(ussDom, function(item) {
                item =  $(item).closest('.tg-scope');
                let itemScope = item.scope();
                itemScope.us.milestone = $scope.sprints[0].id;
                return itemScope.us;
            });
        };

        let moveUssToSprint = function(selectedUss, sprint) {
            let ussCurrent = _($scope.userstories);

            // Remove them from backlog
            $scope.userstories = ussCurrent.without.apply(ussCurrent, selectedUss).value();

            let extraPoints = _.map(selectedUss, (v, k) => v.total_points);
            let totalExtraPoints =  _.reduce(extraPoints, (acc, num) => acc + num);

            // Add them to current sprint
            sprint.user_stories = _.union(sprint.user_stories, selectedUss);

            // Update the total of points
            sprint.total_points += totalExtraPoints;

            let data = _.map(selectedUss, us =>
                ({
                    us_id: us.id,
                    order: us.sprint_order
                })
        );
            $rs.userstories.bulkUpdateMilestone($scope.project.id, $scope.sprints[0].id, data).then(() => {
                $ctrl.loadSprints();
                $ctrl.loadProjectStats();
                $ctrl.toggleVelocityForecasting();
                return $ctrl.calculateForecasting();
            });

            return $el.find(".move-to-sprint").hide();
        };

        let moveToCurrentSprint = selectedUss => moveUssToSprint(selectedUss, $scope.currentSprint);

        let moveToLatestSprint = selectedUss => moveUssToSprint(selectedUss, $scope.sprints[0]);

        $scope.$on("sprintform:create:success:callback", (e, ussToMove) => _.partial(moveToCurrentSprint, ussToMove)());

        let shiftPressed = false;
        let lastChecked = null;

        let checkSelected = function(target) {
            lastChecked = target.closest(".us-item-row");
            target.closest('.us-item-row').toggleClass('ui-multisortable-multiple');
            let moveToSprintDom = $el.find(".move-to-sprint");
            let selectedUsDom = $el.find(".backlog-table-body input:checkbox:checked");

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
                let current = $(event.currentTarget).closest(".us-item-row");
                let nextAll = lastChecked.nextAll();
                let prevAll = lastChecked.prevAll();

                if (_.some(nextAll, next => next === current[0])) {
                    elements = lastChecked.nextUntil(current);
                } else if (_.some(prevAll, prev => prev === current[0])) {
                    elements = lastChecked.prevUntil(current);
                }

                _.map(elements, function(elm) {
                    let input = $(elm).find("input:checkbox");
                    input.prop('checked', true);
                    return checkSelected(input);
                });
            }

            let target = angular.element(event.currentTarget);
            target.closest(".us-item-row").toggleClass('is-checked');
            return checkSelected(target);
        });

        $el.on("click", "#move-to-latest-sprint", event => {
            ussToMove = getUsToMove();

            return $scope.$apply(_.partial(moveToLatestSprint, ussToMove));
        });

        $el.on("click", "#move-to-current-sprint", event => {
            ussToMove = getUsToMove();

            return $scope.$apply(_.partial(moveToCurrentSprint, ussToMove));
        });

        $el.on("click", "#show-tags", function(event) {
            event.preventDefault();

            $ctrl.toggleShowTags();

            return showHideTags($ctrl);
        });

        return $el.on("click", ".forecasting-add-sprint", function(event) {
            let ussToMoveList = $ctrl.forecastedStories;
            if ($scope.currentSprint) {
                ussToMove = _.map(ussToMoveList, function(us, index) {
                    us.milestone = $scope.currentSprint.id;
                    us.order = index;
                    return us;
                });

                return $scope.$apply(_.partial(moveToCurrentSprint, ussToMove));
            } else {
                ussToMove = _.map(ussToMoveList, function(us, index) {
                    us.order = index;
                    return us;
                });

                return $rootscope.$broadcast("sprintform:create", $scope.projectId, ussToMove);
            }
        });
    };

    var showHideTags = function($ctrl) {
        let text;
        let elm = angular.element("#show-tags");

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

    let openFilterInit = function($scope, $el, $ctrl) {
        let sidebar = $el.find("sidebar.backlog-filter");

        sidebar.addClass("active");

        return $ctrl.activeFilters = true;
    };

    let showHideFilter = function($scope, $el, $ctrl) {
        let sidebar = $el.find("sidebar.backlog-filter");
        sidebar.one("transitionend", () =>
            timeout(150, function() {
                $rootscope.$broadcast("resize");
                return $('.burndown').css("visibility", "visible");
            })
        );

        let target = angular.element("#show-filters-button");
        $('.burndown').css("visibility", "hidden");
        sidebar.toggleClass("active");
        target.toggleClass("active");

        let hideText = $translate.instant("BACKLOG.FILTERS.HIDE");
        let showText = $translate.instant("BACKLOG.FILTERS.SHOW");

        toggleText(target, [hideText, showText]);

        return $ctrl.toggleActiveFilters();
    };

    //# Filters Link

    let linkFilters = function($scope, $el, $attrs, $ctrl) {
        $scope.filtersSearch = {};
        return $el.on("click", "#show-filters-button", function(event) {
            event.preventDefault();
            return $scope.$apply(() => showHideFilter($scope, $el, $ctrl));
        });
    };

    let link = function($scope, $el, $attrs, $rootscope) {
        let $ctrl = $el.controller();

        linkToolbar($scope, $el, $attrs, $ctrl);
        linkFilters($scope, $el, $attrs, $ctrl);
        linkDoomLine($scope, $el, $attrs, $ctrl);

        let filters = $ctrl.location.search();
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


module.directive("tgBacklog", ["$tgRepo", "$rootScope", "$translate", "$tgResources", BacklogDirective]);

//############################################################################
//# User story points directive
//############################################################################

let UsRolePointsSelectorDirective = function($rootscope, $template, $compile, $translate) {
    let selectionTemplate = $template.get("backlog/us-role-points-popover.html", true);

    let link = function($scope, $el, $attrs) {
        // Watchers
        bindOnce($scope, "project", function(project) {
            let roles = _.filter(project.roles, "computable");
            let numberOfRoles = _.size(roles);

            if (numberOfRoles > 1) {
                return $el.append($compile(selectionTemplate({"roles": roles}))($scope));
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

            let text = $translate.instant("COMMON.FIELDS.POINTS");
            return $el.find(".header-points").text(text);
        });

        // Dom Event Handlers
        $el.on("click", function(event) {
            let target = angular.element(event.target);

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
            let target = angular.element(event.currentTarget);
            let rolScope = target.scope();
            return $rootscope.$broadcast("uspoints:select", target.data("role-id"), target.text());
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgUsRolePointsSelector", ["$rootScope", "$tgTemplate", "$compile", "$translate", UsRolePointsSelectorDirective]);


let UsPointsDirective = function($tgEstimationsService, $repo, $tgTemplate) {
    let rolesTemplate = $tgTemplate.get("common/estimation/us-points-roles-popover.html", true);

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        let updatingSelectedRoleId = null;
        let selectedRoleId = null;
        let filteringRoleId = null;
        let estimationProcess = null;

        $scope.$on("uspoints:select", function(ctx, roleId, roleName) {
            let us = $scope.$eval($attrs.tgBacklogUsPoints);
            selectedRoleId = roleId;
            return estimationProcess.render();
        });

        $scope.$on("uspoints:clear-selection", function(ctx) {
            let us = $scope.$eval($attrs.tgBacklogUsPoints);
            selectedRoleId = null;
            return estimationProcess.render();
        });

        $scope.$watch($attrs.tgBacklogUsPoints, function(us) {
            if (us) {
                estimationProcess = $tgEstimationsService.create($el, us, $scope.project);

                // Update roles
                let roles = estimationProcess.calculateRoles();
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
                    let totalPoints = this.calculateTotalPoints();
                    if ((selectedRoleId == null) || (roles.length === 1)) {
                        text = totalPoints;
                        title = totalPoints;
                    } else {
                        let pointId = this.us.points[selectedRoleId];
                        let pointObj = this.pointsById[pointId];
                        text = `${pointObj.name} / <span>${totalPoints}</span>`;
                        title = `${pointObj.name} / ${totalPoints}`;
                    }

                    let ctx = {
                        totalPoints,
                        roles: this.calculateRoles(),
                        editable: this.isEditable,
                        text,
                        title
                    };
                    let mainTemplate = "common/estimation/us-estimation-total.html";
                    let template = $tgTemplate.get(mainTemplate, true);
                    let html = template(ctx);
                    return this.$el.html(html);
                };

                return estimationProcess.render();
            }
        });

        let renderRolesSelector = function() {
            let roles = estimationProcess.calculateRoles();
            let html = rolesTemplate({"roles": roles});
            // Render into DOM and show the new created element
            $el.append(html);
            return $el.find(".pop-role").popover().open(function() { return $(this).remove(); });
        };

        var bindClickElements = function() {
            $el.on("click", "a.us-points", function(event) {
                event.preventDefault();
                event.stopPropagation();
                let us = $scope.$eval($attrs.tgBacklogUsPoints);
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
                let target = angular.element(event.currentTarget);
                let us = $scope.$eval($attrs.tgBacklogUsPoints);
                updatingSelectedRoleId = target.data("role-id");
                let popRolesDom = $el.find(".pop-role");
                popRolesDom.find("a").removeClass("active");
                popRolesDom.find(`a[data-role-id='${updatingSelectedRoleId}']`).addClass("active");
                return estimationProcess.renderPointsSelector(updatingSelectedRoleId);
            });
        };

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgBacklogUsPoints", ["$tgEstimationsService", "$tgRepo", "$tgTemplate", UsPointsDirective]);


//############################################################################
//# Burndown graph directive
//############################################################################
let ToggleBurndownVisibility = function($storage) {
    let hide = function() {
        $(".js-burndown-graph").removeClass("shown");
        $(".js-toggle-burndown-visibility-button").removeClass("active");
        return $(".js-burndown-graph").removeClass("open");
    };

    let show = function(firstLoad) {
        $(".js-toggle-burndown-visibility-button").addClass("active");

        if (firstLoad) {
            return $(".js-burndown-graph").addClass("shown");
        } else {
            return $(".js-burndown-graph").addClass("open");
        }
    };

    let link = function($scope, $el, $attrs) {
        let firstLoad = true;
        let hash = generateHash(["is-burndown-grpahs-collapsed"]);
        $scope.isBurndownGraphCollapsed = $storage.get(hash) || false;

        let toggleGraph = function() {
            if ($scope.isBurndownGraphCollapsed) {
                hide(firstLoad);
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
        link
    };
};

module.directive("tgToggleBurndownVisibility", ["$tgStorage", ToggleBurndownVisibility]);


//############################################################################
//# Burndown graph directive
//############################################################################

let BurndownBacklogGraphDirective = function($translate) {
    let redrawChart = function(element, dataToDraw) {
        let width = element.width();
        element.height(width/6);
        let milestonesRange = __range__(0, (dataToDraw.milestones.length - 1), true);
        let data = [];
        let zero_line = _.map(dataToDraw.milestones, ml => 0);
        data.push({
            data: _.zip(milestonesRange, zero_line),
            lines: {
                fillColor : "rgba(0,0,0,0)"
            },
            points: {
                show: false
            }
        });
        let optimal_line = _.map(dataToDraw.milestones, ml => ml.optimal);
        data.push({
            data: _.zip(milestonesRange, optimal_line),
            lines: {
                fillColor : "rgba(120,120,120,0.2)"
            }
        });
        let evolution_line = _.filter(_.map(dataToDraw.milestones, ml => ml.evolution), evolution => evolution != null);
        data.push({
            data: _.zip(milestonesRange, evolution_line),
            lines: {
                fillColor : "rgba(102,153,51,0.3)"
            }
        });
        let client_increment_line = _.map(dataToDraw.milestones, ml => -ml["team-increment"] - ml["client-increment"]);
        data.push({
            data: _.zip(milestonesRange, client_increment_line),
            lines: {
                fillColor : "rgba(255,51,51,0.3)"
            }
        });
        let team_increment_line = _.map(dataToDraw.milestones, ml => -ml["team-increment"]);
        data.push({
            data: _.zip(milestonesRange, team_increment_line),
            lines: {
                fillColor : "rgba(153,51,51,0.3)"
            }
        });
        let colors = [
            "rgba(0,0,0,1)",
            "rgba(120,120,120,0.2)",
            "rgba(102,153,51,1)",
            "rgba(153,51,51,1)",
            "rgba(255,51,51,1)"
        ];

        let options = {
            grid: {
                borderWidth: { top: 0, right: 1, left:0, bottom: 0 },
                borderColor: "#ccc",
                hoverable: true
            },
            xaxis: {
                ticks: dataToDraw.milestones.length,
                axisLabel: $translate.instant("BACKLOG.CHART.XAXIS_LABEL"),
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5,
                tickFormatter(val, axis) { return ""; }
            },
            yaxis: {
                axisLabel: $translate.instant("BACKLOG.CHART.YAXIS_LABEL"),
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5
            },
            series: {
                shadowSize: 0,
                lines: {
                    show: true,
                    fill: true
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 4,
                    lineWidth: 2
                }
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
                }
            }
        };

        element.empty();
        return element.plot(data, options).data("plot");
    };

    let link = function($scope, $el, $attrs) {
        let element = angular.element($el);

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

module.directive("tgBurndownBacklogGraph", ["$translate", BurndownBacklogGraphDirective]);


//############################################################################
//# Backlog progress bar directive
//############################################################################

let TgBacklogProgressBarDirective = function($template, $compile) {
    let template = $template.get("backlog/progress-bar.html", true);

    let render = function(scope, el, projectPointsPercentaje, closedPointsPercentaje) {
        let html = template({
            projectPointsPercentaje,
            closedPointsPercentaje
        });
        html = $compile(html)(scope);
        return el.html(html);
    };

    let adjustPercentaje = function(percentage) {
        let adjusted = _.max([0 , percentage]);
        adjusted = _.min([100, adjusted]);
        return Math.round(adjusted);
    };

    let link = function($scope, $el, $attrs) {
        let element = angular.element($el);

        $scope.$watch($attrs.tgBacklogProgressBar, function(stats) {
            if (stats != null) {
                let closedPointsPercentaje, projectPointsPercentaje;
                let totalPoints = stats.total_points ? stats.total_points : stats.defined_points;
                let definedPoints = stats.defined_points;
                let closedPoints = stats.closed_points;
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

module.directive("tgBacklogProgressBar", ["$tgTemplate", "$compile", TgBacklogProgressBarDirective]);

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}