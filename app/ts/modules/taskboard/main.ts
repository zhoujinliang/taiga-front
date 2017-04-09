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
 * File: modules/taskboard.coffee
 */

import {toggleText, groupBy, bindOnce, scopeDefer, timeout, bindMethods, defineImmutableProperty} from "../../utils"
import {FiltersMixin} from "../controllerMixins"

import * as angular from "angular"
import * as _ from "lodash"
import * as moment from "moment"

//############################################################################
//# Taskboard Controller
//############################################################################

export class TaskboardController extends FiltersMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    rs2:any
    params:any
    q:any
    appMetaService:any
    location:any
    navUrls:any
    events:any
    analytics:any
    translate:any
    errorHandlingService:any
    taskboardTasksService:any
    storage:any
    filterRemoteStorageService:any
    isFirstLoad:any
    zoomLevel:any
    zoom:any
    openFilter:any
    zoomLoading:any
    selectedFilters:any
    filters:any
    filterQ:any
    customFilters:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "tgResources",
            "$routeParams",
            "$q",
            "tgAppMetaService",
            "$tgLocation",
            "$tgNavUrls",
            "$tgEvents",
            "$tgAnalytics",
            "$translate",
            "tgErrorHandlingService",
            "tgTaskboardTasks",
            "$tgStorage",
            "tgFilterRemoteStorageService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, rs2, params, q, appMetaService, location, navUrls,
                  events, analytics, translate, errorHandlingService, taskboardTasksService, storage, filterRemoteStorageService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.rs2 = rs2;
        this.params = params;
        this.q = q;
        this.appMetaService = appMetaService;
        this.location = location;
        this.navUrls = navUrls;
        this.events = events;
        this.analytics = analytics;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.taskboardTasksService = taskboardTasksService;
        this.storage = storage;
        this.filterRemoteStorageService = filterRemoteStorageService;
        bindMethods(this);
        this.taskboardTasksService.reset();
        this.scope.userstories = [];
        this.openFilter = false;

        if (this.applyStoredFilters(this.params.pslug, "tasks-filters")) { return; }

        this.scope.sectionName = this.translate.instant("TASKBOARD.SECTION_NAME");
        this.initializeEventHandlers();

        defineImmutableProperty(this.scope, "usTasks", () => {
            return this.taskboardTasksService.usTasks;
        });
    }

    firstLoad() {
        let promise = this.loadInitialData();

        // On Success
        promise.then(() => this._setMeta());
        // On Error
        return promise.then(null, this.onInitialDataError.bind(this));
    }

    setZoom(zoomLevel, zoom) {
        if (this.zoomLevel === zoomLevel) {
            return null;
        }

        this.isFirstLoad = !this.zoomLevel;

        let previousZoomLevel = this.zoomLevel;

        this.zoomLevel = zoomLevel;
        this.zoom = zoom;

        if (this.isFirstLoad) {
            this.firstLoad().then(() => {
                this.isFirstLoad = false;
                return this.taskboardTasksService.resetFolds();
            });

        } else if ((this.zoomLevel > 1) && (previousZoomLevel <= 1)) {
            this.zoomLoading = true;
            this.loadTasks().then(() => {
                this.zoomLoading = false;
                return this.taskboardTasksService.resetFolds();
            });
        }

        if (this.zoomLevel === '0') {
            return this.rootscope.$broadcast("sprint:zoom0");
        }
    }

    changeQ(q) {
        this.replaceFilter("q", q);
        this.loadTasks();
        return this.generateFilters();
    }

    removeFilter(filter) {
        this.unselectFilter(filter.dataType, filter.id);
        this.loadTasks();
        return this.generateFilters();
    }

    addFilter(newFilter) {
        this.selectFilter(newFilter.category.dataType, newFilter.filter.id);
        this.loadTasks();
        return this.generateFilters();
    }

    selectCustomFilter(customFilter) {
        this.replaceAllFilters(customFilter.filter);
        this.loadTasks();
        return this.generateFilters();
    }

    removeCustomFilter(customFilter) {
        return this.filterRemoteStorageService.getFilters(this.scope.projectId, 'tasks-custom-filters').then(userFilters => {
            delete userFilters[customFilter.id];

            return this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, 'tasks-custom-filters').then(this.generateFilters);
        });
    }

    saveCustomFilter(name) {
        let filters:any = {};
        let urlfilters = this.location.search();
        filters.tags = urlfilters.tags;
        filters.status = urlfilters.status;
        filters.assigned_to = urlfilters.assigned_to;
        filters.owner = urlfilters.owner;

        return this.filterRemoteStorageService.getFilters(this.scope.projectId, 'tasks-custom-filters').then(userFilters => {
            userFilters[name] = filters;

            return this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, 'tasks-custom-filters').then(this.generateFilters);
        });
    }

    generateFilters() {
        this.storeFilters(this.params.pslug, this.location.search(), "tasks-filters");

        let urlfilters = this.location.search();

        let loadFilters:any = {};
        loadFilters.project = this.scope.projectId;
        loadFilters.milestone = this.scope.sprintId;
        loadFilters.tags = urlfilters.tags;
        loadFilters.status = urlfilters.status;
        loadFilters.assigned_to = urlfilters.assigned_to;
        loadFilters.owner = urlfilters.owner;
        loadFilters.q = urlfilters.q;

        return this.q.all([
            this.rs.tasks.filtersData(loadFilters),
            this.filterRemoteStorageService.getFilters(this.scope.projectId, 'tasks-custom-filters')
        ]).then(result => {
            let selected;
            let data = result[0];
            let customFiltersRaw = result[1];

            let statuses = _.map(data.statuses, function(it:any) {
                it.id = it.id.toString();

                return it;
            });
            let tags = _.map(data.tags, function(it:any) {
                it.id = it.name;

                return it;
            });

            let tagsWithAtLeastOneElement = _.filter(tags, (tag:any) => tag.count > 0);

            let assignedTo = _.map(data.assigned_to, function(it:any) {
                if (it.id) {
                    it.id = it.id.toString();
                } else {
                    it.id = "null";
                }

                it.name = it.full_name || "Unassigned";

                return it;
            });
            let owner = _.map(data.owners, function(it:any) {
                it.id = it.id.toString();
                it.name = it.full_name;

                return it;
            });

            this.selectedFilters = [];

            if (loadFilters.status) {
                selected = this.formatSelectedFilters("status", statuses, loadFilters.status);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            if (loadFilters.tags) {
                selected = this.formatSelectedFilters("tags", tags, loadFilters.tags);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            if (loadFilters.assigned_to) {
                selected = this.formatSelectedFilters("assigned_to", assignedTo, loadFilters.assigned_to);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            if (loadFilters.owner) {
                selected = this.formatSelectedFilters("owner", owner, loadFilters.owner);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            this.filterQ = loadFilters.q;

            this.filters = [
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.STATUS"),
                    dataType: "status",
                    content: statuses
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.TAGS"),
                    dataType: "tags",
                    content: tags,
                    hideEmpty: true,
                    totalTaggedElements: tagsWithAtLeastOneElement.length
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.ASSIGNED_TO"),
                    dataType: "assigned_to",
                    content: assignedTo
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.CREATED_BY"),
                    dataType: "owner",
                    content: owner
                }
            ];

            this.customFilters = [];
            return _.forOwn(customFiltersRaw, (value, key) => {
                return this.customFilters.push({id: key, name: key, filter: value});
            });
        });
    }

    _setMeta() {
        let prettyDate = this.translate.instant("BACKLOG.SPRINTS.DATE");

        let title = this.translate.instant("TASKBOARD.PAGE_TITLE", {
            projectName: this.scope.project.name,
            sprintName: this.scope.sprint.name
        });
        let description =  this.translate.instant("TASKBOARD.PAGE_DESCRIPTION", {
            projectName: this.scope.project.name,
            sprintName: this.scope.sprint.name,
            startDate: moment(this.scope.sprint.estimated_start).format(prettyDate),
            endDate: moment(this.scope.sprint.estimated_finish).format(prettyDate),
            completedPercentage: this.scope.stats.completedPercentage || "0",
            completedPoints: this.scope.stats.completedPointsSum || "--",
            totalPoints: this.scope.stats.totalPointsSum || "--",
            openTasks: this.scope.stats.openTasks || "--",
            totalTasks: this.scope.stats.total_tasks || "--"
        });

        return this.appMetaService.setAll(title, description);
    }

    initializeEventHandlers() {
        this.scope.$on("taskform:bulk:success", (event, tasks) => {
            this.refreshTagsColors().then(() => {
                return this.taskboardTasksService.add(tasks);
            });

            return this.analytics.trackEvent("task", "create", "bulk create task on taskboard", 1);
        });

        this.scope.$on("taskform:new:success", (event, task) => {
            this.refreshTagsColors().then(() => {
                return this.taskboardTasksService.add(task);
            });

            return this.analytics.trackEvent("task", "create", "create task on taskboard", 1);
        });

        this.scope.$on("taskform:edit:success", (event, task) => {
            return this.refreshTagsColors().then(() => {
                return this.taskboardTasksService.replaceModel(task);
            });
        });

        this.scope.$on("taskboard:task:move", this.taskMove);
        return this.scope.$on("assigned-to:added", this.onAssignedToChanged);
    }

    onAssignedToChanged(ctx, userid, taskModel) {
        taskModel.assigned_to = userid;

        this.taskboardTasksService.replaceModel(taskModel);

        let promise = this.repo.save(taskModel);
        return promise.then(null, () => console.log("FAIL")); // TODO
    }

    initializeSubscription() {
        let routingKey = `changes.project.${this.scope.projectId}.tasks`;
        this.events.subscribe(this.scope, routingKey, message => {
            return this.loadTaskboard();
        });

        let routingKey1 = `changes.project.${this.scope.projectId}.userstories`;
        return this.events.subscribe(this.scope, routingKey1, message => {
            this.refreshTagsColors();
            this.loadSprintStats();
            return this.loadSprint();
        });
    }

    loadProject() {
        return this.rs.projects.get(this.scope.projectId).then(project => {
            if (!project.is_backlog_activated) {
                this.errorHandlingService.permissionDenied();
            }

            this.scope.project = project;
            // Not used at this momment
            this.scope.pointsList = _.sortBy(project.points, "order");
            this.scope.pointsById = groupBy(project.points, e => e.id);
            this.scope.roleById = groupBy(project.roles, e => e.id);
            this.scope.taskStatusList = _.sortBy(project.task_statuses, "order");
            this.scope.usStatusList = _.sortBy(project.us_statuses, "order");
            this.scope.usStatusById = groupBy(project.us_statuses, e => e.id);

            this.scope.$emit('project:loaded', project);

            this.fillUsersAndRoles(project.members, project.roles);

            return project;
        });
    }

    loadSprintStats() {
        return this.rs.sprints.stats(this.scope.projectId, this.scope.sprintId).then(stats => {
            let totalPointsSum =_.reduce(_.values(stats.total_points), ((res:number, n:number) => res + n), 0);
            let completedPointsSum = _.reduce(_.values(stats.completed_points), ((res:number, n:number) => res + n), 0);
            let remainingPointsSum = totalPointsSum - completedPointsSum;
            let remainingTasks = stats.total_tasks - stats.completed_tasks;
            this.scope.stats = stats;
            this.scope.stats.totalPointsSum = totalPointsSum;
            this.scope.stats.completedPointsSum = completedPointsSum;
            this.scope.stats.remainingPointsSum = remainingPointsSum;
            this.scope.stats.remainingTasks = remainingTasks;
            if (stats.totalPointsSum) {
                this.scope.stats.completedPercentage = Math.round((100*stats.completedPointsSum)/stats.totalPointsSum);
            } else {
                this.scope.stats.completedPercentage = 0;
            }

            this.scope.stats.openTasks = stats.total_tasks - stats.completed_tasks;
            return stats;
        });
    }

    refreshTagsColors() {
        return this.rs.projects.tagsColors(this.scope.projectId).then(tags_colors => {
            return this.scope.project.tags_colors = tags_colors._attrs;
        });
    }

    loadSprint() {
        return this.rs.sprints.get(this.scope.projectId, this.scope.sprintId).then(sprint => {
            this.scope.sprint = sprint;
            this.scope.userstories = _.sortBy(sprint.user_stories, "sprint_order");

            this.taskboardTasksService.setUserstories(this.scope.userstories);

            return sprint;
        });
    }

    loadTasks() {
        let params:any = {};

        if (this.zoomLevel > 1) {
            params.include_attachments = 1;
        }

        params = _.merge(params, this.location.search());

        return this.rs.tasks.list(this.scope.projectId, this.scope.sprintId, null, params).then(tasks => {
            this.taskboardTasksService.init(this.scope.project, this.scope.usersById);
            return this.taskboardTasksService.set(tasks);
        });
    }

    loadTaskboard() {
        return this.q.all([
            this.refreshTagsColors(),
            this.loadSprintStats(),
            this.loadSprint().then(() => this.loadTasks())
        ]);
    }

    loadInitialData() {
        let params = {
            pslug: this.params.pslug,
            sslug: this.params.sslug
        };

        let promise = this.repo.resolve(params).then(data => {
            this.scope.projectId = data.project;
            this.scope.sprintId = data.milestone;
            this.initializeSubscription();
            return data;
        });

        return promise.then(() => this.loadProject())
                      .then(() => {
                          this.generateFilters();

                          return this.loadTaskboard().then(() => this.setRolePoints());
        });
    }

    showPlaceHolder(statusId, usId) {
        if (!this.taskboardTasksService.tasksRaw.length) {
            if ((this.scope.taskStatusList[0].id === statusId) &&
              (!this.scope.userstories.length || (this.scope.userstories[0].id === usId))) {
                return true;
            }
        }

        return false;
    }

    editTask(id) {
        let task = this.taskboardTasksService.getTask(id);

        task = task.set('loading', true);
        this.taskboardTasksService.replace(task);

        return this.rs.tasks.getByRef(task.getIn(['model', 'project']), task.getIn(['model', 'ref'])).then(editingTask => {
             return this.rs2.attachments.list("task", task.get('id'), task.getIn(['model', 'project'])).then(attachments => {
                this.rootscope.$broadcast("taskform:edit", editingTask, attachments.toJS());
                task = task.set('loading', false);
                return this.taskboardTasksService.replace(task);
             });
        });
    }

    taskMove(ctx, task, oldStatusId, usId, statusId, order) {
        let promise;
        task = this.taskboardTasksService.getTaskModel(task.get('id'));

        let moveUpdateData = this.taskboardTasksService.move(task.id, usId, statusId, order);

        let params = {
            status__is_archived: false,
            include_attachments: true,
        };

        let options = {
            headers: {
                "set-orders": JSON.stringify(moveUpdateData.set_orders)
            }
        };

        return promise = this.repo.save(task, true, params, options, true).then(result => {
            let headers = result[1];

            if (headers && headers['taiga-info-order-updated']) {
                order = JSON.parse(headers['taiga-info-order-updated']);
                this.taskboardTasksService.assignOrders(order);
            }

            return this.loadSprintStats();
        });
    }

    //# Template actions
    addNewTask(type, us) {
        switch (type) {
            case "standard": return this.rootscope.$broadcast("taskform:new", this.scope.sprintId, us != null ? us.id : undefined);
            case "bulk": return this.rootscope.$broadcast("taskform:bulk", this.scope.sprintId, us != null ? us.id : undefined);
        }
    }

    toggleFold(id) {
        return this.taskboardTasksService.toggleFold(id);
    }

    changeTaskAssignedTo(id) {
        let task = this.taskboardTasksService.getTaskModel(id);

        return this.rootscope.$broadcast("assigned-to:add", task);
    }

    setRolePoints() {
        let computableRoles = _.filter(this.scope.project.roles, "computable");

        let getRole = roleId => {
            roleId = parseInt(roleId, 10);
            return _.find(computableRoles, (role:any) => role.id === roleId);
        };

        let getPoint = pointId => {
            let poitnId = parseInt(pointId, 10);
            return _.find(this.scope.project.points, (point:any) => point.id === pointId);
        };

        let pointsByRole = _.reduce(this.scope.userstories, (result, us:any, key) => {
            _.forOwn(us.points, function(pointId, roleId) {
                let role = getRole(roleId);
                let point = getPoint(pointId);

                if (!result[role.id]) {
                    result[role.id] = role;
                    result[role.id].points = 0;
                }

                return result[role.id].points += point.value;
            });

            return result;
        }
        , {});

        return this.scope.pointsByRole = Object.keys(pointsByRole).map(key => pointsByRole[key]);
    }
}
TaskboardController.initClass();

//############################################################################
//# TaskboardDirective
//############################################################################

export let TaskboardDirective = function($rootscope) {
    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        $el.on("click", ".toggle-analytics-visibility", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            target.toggleClass('active');
            return $rootscope.$broadcast("taskboard:graph:toggle-visibility");
        });

        let tableBodyDom = $el.find(".taskboard-table-body");
        tableBodyDom.on("scroll", function(event) {
            let target = angular.element(event.currentTarget);
            let tableHeaderDom = $el.find(".taskboard-table-header .taskboard-table-inner");
            return tableHeaderDom.css("left", -1 * target.scrollLeft());
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Taskboard Squish Column Directive
//############################################################################

export let TaskboardSquishColumnDirective = function(rs) {
    let avatarWidth = 40;
    let maxColumnWidth = 300;

    let link = function($scope, $el, $attrs) {
        let recalculateTaskboardWidth, width;
        $scope.$on("sprint:zoom0", () => {
            return recalculateTaskboardWidth();
        });

        $scope.$on("sprint:task:moved", () => {
            return recalculateTaskboardWidth();
        });

        $scope.$watch("usTasks", function() {
            if ($scope.project) {
                $scope.statusesFolded = rs.tasks.getStatusColumnModes($scope.project.id);
                $scope.usFolded = rs.tasks.getUsRowModes($scope.project.id, $scope.sprintId);

                return recalculateTaskboardWidth();
            }
        });

        $scope.foldStatus = function(status) {
            $scope.statusesFolded[status.id] = !!!$scope.statusesFolded[status.id];
            rs.tasks.storeStatusColumnModes($scope.projectId, $scope.statusesFolded);

            return recalculateTaskboardWidth();
        };

        $scope.foldUs = function(us) {
            if (us) {
                $scope.usFolded[us.id] = !!!$scope.usFolded[us.id];
            }

            rs.tasks.storeUsRowModes($scope.projectId, $scope.sprintId, $scope.usFolded);

            return recalculateTaskboardWidth();
        };

        let getCeilWidth = (usId, statusId) => {
            let tasks;
            if (usId) {
                tasks = $scope.usTasks.getIn([usId.toString(), statusId.toString()]).size;
            } else {
                tasks = $scope.usTasks.getIn(['null', statusId.toString()]).size;
            }

            if ($scope.statusesFolded[statusId]) {
                if (tasks && $scope.usFolded[usId]) {
                    let tasksMatrixSize = Math.round(Math.sqrt(tasks));
                    width = avatarWidth * tasksMatrixSize;
                } else {
                    width = avatarWidth;
                }

                return width;
            }

            return 0;
        };

        let setStatusColumnWidth = (statusId, width) => {
            let column = $el.find(`.squish-status-${statusId}`);

            if (width) {
                return column.css('max-width', width);
            } else {
                if ($scope.ctrl.zoomLevel === '0') {
                    return column.css("max-width", 148);
                } else {
                    return column.css("max-width", maxColumnWidth);
                }
            }
        };

        let refreshTaskboardTableWidth = () => {
            let columnWidths = [];

            let columns = $el.find(".task-colum-name");

            columnWidths = _.map(columns, column => $(column).outerWidth(true));

            let totalWidth = _.reduce(columnWidths, (total, width) => total + width);

            return $el.find('.taskboard-table-inner').css("width", totalWidth);
        };

        let recalculateStatusColumnWidth = statusId => {
            //unassigned ceil
            let statusFoldedWidth = getCeilWidth(null, statusId);

            _.forEach($scope.userstories, function(us) {
                width = getCeilWidth(us.id, statusId);
                if (width > statusFoldedWidth) { return statusFoldedWidth = width; }
            });

            return setStatusColumnWidth(statusId, statusFoldedWidth);
        };

        return recalculateTaskboardWidth = () => {
            _.forEach($scope.taskStatusList, status => recalculateStatusColumnWidth(status.id));

            refreshTaskboardTableWidth();

        };
    };

    return {link};
};
