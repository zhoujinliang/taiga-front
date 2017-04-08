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
 * File: modules/kanban/main.coffee
 */

import {toggleText, scopeDefer, bindOnce, groupBy, timeout, bindMethods, defineImmutableProperty} from "../../utils"
import {UsFiltersMixin} from "../controllerMixins"

import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaKanban");

//############################################################################
//# Kanban Controller
//############################################################################

class KanbanController extends UsFiltersMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    rs2:any
    params:any
    q:any
    location:any
    appMetaService:any
    navUrls:any
    events:any
    analytics:any
    translate:any
    errorHandlingService:any
    model:any
    kanbanUserstoriesService:any
    storage:any
    filterRemoteStorageService:any
    projectService:any
    storeCustomFiltersName:any
    storeFiltersName:any
    openFilter:any
    isFirstLoad:any
    zoomLevel:any
    zoom:any
    zoomLoading:any

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
            "$tgLocation",
            "tgAppMetaService",
            "$tgNavUrls",
            "$tgEvents",
            "$tgAnalytics",
            "$translate",
            "tgErrorHandlingService",
            "$tgModel",
            "tgKanbanUserstories",
            "$tgStorage",
            "tgFilterRemoteStorageService",
            "tgProjectService"
        ];

        this.prototype.storeCustomFiltersName = 'kanban-custom-filters';
        this.prototype.storeFiltersName = 'kanban-filters';
    }

    constructor(scope, rootscope, repo, confirm, rs, rs2, params, q, location,
                  appMetaService, navUrls, events, analytics, translate, errorHandlingService,
                  model, kanbanUserstoriesService, storage, filterRemoteStorageService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.rs2 = rs2;
        this.params = params;
        this.q = q;
        this.location = location;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.events = events;
        this.analytics = analytics;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.model = model;
        this.kanbanUserstoriesService = kanbanUserstoriesService;
        this.storage = storage;
        this.filterRemoteStorageService = filterRemoteStorageService;
        this.projectService = projectService;
        bindMethods(this);
        this.kanbanUserstoriesService.reset();
        this.openFilter = false;

        if (this.applyStoredFilters(this.params.pslug, "kanban-filters")) { return; }

        this.scope.sectionName = this.translate.instant("KANBAN.SECTION_NAME");
        this.initializeEventHandlers();

        defineImmutableProperty(this.scope, "usByStatus", () => {
            return this.kanbanUserstoriesService.usByStatus;
        });
    }

    firstLoad() {
        let promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            let title = this.translate.instant("KANBAN.PAGE_TITLE", {projectName: this.scope.project.name});
            let description = this.translate.instant("KANBAN.PAGE_DESCRIPTION", {
                projectName: this.scope.project.name,
                projectDescription: this.scope.project.description
            });
            return this.appMetaService.setAll(title, description);
        });

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
            return this.firstLoad().then(() => {
                this.isFirstLoad = false;
                return this.kanbanUserstoriesService.resetFolds();
            });

        } else if ((this.zoomLevel > 1) && (previousZoomLevel <= 1)) {
            this.zoomLoading = true;

            return this.loadUserstories().then(() => {
                this.zoomLoading = false;
                return this.kanbanUserstoriesService.resetFolds();
            });
        }
    }

    filtersReloadContent() {
        return this.loadUserstories().then(() => {
            let openArchived = _.difference(this.kanbanUserstoriesService.archivedStatus,
                                        this.kanbanUserstoriesService.statusHide);
            if (openArchived.length) {
                return Array.from(openArchived).map((statusId) =>
                    this.loadUserStoriesForStatus({}, statusId));
            }
        });
    }

    initializeEventHandlers() {
        this.scope.$on("usform:new:success", (event, us) => {
            this.refreshTagsColors().then(() => {
                return this.kanbanUserstoriesService.add(us);
            });

            return this.analytics.trackEvent("userstory", "create", "create userstory on kanban", 1);
        });

        this.scope.$on("usform:bulk:success", (event, uss) => {
            this.refreshTagsColors().then(() => {
                return this.kanbanUserstoriesService.add(uss);
            });

            return this.analytics.trackEvent("userstory", "create", "bulk create userstory on kanban", 1);
        });

        this.scope.$on("usform:edit:success", (event, us) => {
            return this.refreshTagsColors().then(() => {
                return this.kanbanUserstoriesService.replaceModel(us);
            });
        });

        this.scope.$on("assigned-to:added", this.onAssignedToChanged);
        this.scope.$on("kanban:us:move", this.moveUs);
        this.scope.$on("kanban:show-userstories-for-status", this.loadUserStoriesForStatus);
        return this.scope.$on("kanban:hide-userstories-for-status", this.hideUserStoriesForStatus);
    }

    addNewUs(type, statusId) {
        switch (type) {
            case "standard": return this.rootscope.$broadcast("usform:new",
                                                       this.scope.projectId, statusId, this.scope.usStatusList);
            case "bulk": return this.rootscope.$broadcast("usform:bulk",
                                                   this.scope.projectId, statusId);
        }
    }

    editUs(id) {
        let us = this.kanbanUserstoriesService.getUs(id);
        us = us.set('loading', true);
        this.kanbanUserstoriesService.replace(us);

        return this.rs.userstories.getByRef(us.getIn(['model', 'project']), us.getIn(['model', 'ref']))
         .then(editingUserStory => {
            return this.rs2.attachments.list("us", us.get('id'), us.getIn(['model', 'project'])).then(attachments => {
                this.rootscope.$broadcast("usform:edit", editingUserStory, attachments.toJS());

                us = us.set('loading', false);
                return this.kanbanUserstoriesService.replace(us);
            });
        });
    }

    showPlaceHolder(statusId) {
        if ((this.scope.usStatusList[0].id === statusId) &&
          !this.kanbanUserstoriesService.userstoriesRaw.length) {
            return true;
        }

        return false;
    }

    toggleFold(id) {
        return this.kanbanUserstoriesService.toggleFold(id);
    }

    isUsInArchivedHiddenStatus(usId) {
        return this.kanbanUserstoriesService.isUsInArchivedHiddenStatus(usId);
    }

    changeUsAssignedTo(id) {
        let us = this.kanbanUserstoriesService.getUsModel(id);

        return this.rootscope.$broadcast("assigned-to:add", us);
    }

    onAssignedToChanged(ctx, userid, usModel) {
        usModel.assigned_to = userid;

        this.kanbanUserstoriesService.replaceModel(usModel);

        let promise = this.repo.save(usModel);
        return promise.then(null, () => console.log("FAIL")); // TODO
    }

    refreshTagsColors() {
        return this.rs.projects.tagsColors(this.scope.projectId).then(tags_colors => {
            return this.scope.project.tags_colors = tags_colors._attrs;
        });
    }

    loadUserstories() {
        let params:any = {
            status__is_archived: false
        };

        if (this.zoomLevel > 1) {
            params.include_attachments = 1;
            params.include_tasks = 1;
        }

        params = _.merge(params, this.location.search());

        let promise = this.rs.userstories.listAll(this.scope.projectId, params).then(userstories => {
            this.kanbanUserstoriesService.init(this.scope.project, this.scope.usersById);
            this.kanbanUserstoriesService.set(userstories);

            // The broadcast must be executed when the DOM has been fully reloaded.
            // We can't assure when this exactly happens so we need a defer
            scopeDefer(this.scope, () => {
                return this.scope.$broadcast("userstories:loaded", userstories);
            });

            return userstories;
        });

        promise.then( () => this.scope.$broadcast("redraw:wip"));

        return promise;
    }

    loadUserStoriesForStatus(ctx, statusId) {
        let filteredStatus = this.location.search().status;

        // if there are filters applied the action doesn't end if the statusId is not in the url
        if (filteredStatus) {
            filteredStatus = filteredStatus.split(",").map(it => parseInt(it, 10));

            if (filteredStatus.indexOf(statusId) === -1) { return; }
        }

        let params = {
            status: statusId,
            include_attachments: true,
            include_tasks: true
        };

        params = _.merge(params, this.location.search());

        return this.rs.userstories.listAll(this.scope.projectId, params).then(userstories => {
            this.scope.$broadcast("kanban:shown-userstories-for-status", statusId, userstories);

            return userstories;
        });
    }

    hideUserStoriesForStatus(ctx, statusId) {
        return this.scope.$broadcast("kanban:hidden-userstories-for-status", statusId);
    }

    loadKanban() {
        return this.q.all([
            this.refreshTagsColors(),
            this.loadUserstories()
        ]);
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.is_kanban_activated) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.projectId = project.id;
        this.scope.points = _.sortBy(project.points, "order");
        this.scope.pointsById = groupBy(project.points, x => x.id);
        this.scope.usStatusById = groupBy(project.us_statuses, x => x.id);
        this.scope.usStatusList = _.sortBy(project.us_statuses, "order");

        this.scope.$emit("project:loaded", project);
        return project;
    }

    initializeSubscription() {
        let routingKey1 = `changes.project.${this.scope.projectId}.userstories`;
        return this.events.subscribe(this.scope, routingKey1, message => {
            return this.loadUserstories();
        });
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        this.initializeSubscription();
        this.loadKanban();
        return this.generateFilters();
    }

    // Utils methods

    prepareBulkUpdateData(uses, field) {
        if (field == null) { field = "kanban_order"; }
        return _.map(uses, (x:any) => ({"us_id": x.id, "order": x[field]}));
    }

    moveUs(ctx, us, oldStatusId, newStatusId, index) {
        us = this.kanbanUserstoriesService.getUsModel(us.get('id'));

        let moveUpdateData = this.kanbanUserstoriesService.move(us.id, newStatusId, index);

        let params = {
            include_attachments: true,
            include_tasks: true
        };

        let options = {
            headers: {
                "set-orders": JSON.stringify(moveUpdateData.set_orders)
            }
        };

        let promise = this.repo.save(us, true, params, options, true);

        promise = promise.then(result => {
            let headers = result[1];

            if (headers && headers['taiga-info-order-updated']) {
                let order = JSON.parse(headers['taiga-info-order-updated']);
                return this.kanbanUserstoriesService.assignOrders(order);
            }
        });

        return promise;
    }
}
KanbanController.initClass();

module.controller("KanbanController", KanbanController);

//############################################################################
//# Kanban Directive
//############################################################################

let KanbanDirective = function($repo, $rootscope) {
    let link = function($scope, $el, $attrs) {
        let tableBodyDom = $el.find(".kanban-table-body");

        tableBodyDom.on("scroll", function(event) {
            let target = angular.element(event.currentTarget);
            let tableHeaderDom = $el.find(".kanban-table-header .kanban-table-inner");
            return tableHeaderDom.css("left", -1 * target.scrollLeft());
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgKanban", ["$tgRepo", "$rootScope", KanbanDirective]);

//############################################################################
//# Kanban Archived Status Column Header Control
//############################################################################

let KanbanArchivedStatusHeaderDirective = function($rootscope, $translate, kanbanUserstoriesService) {
    let showArchivedText = $translate.instant("KANBAN.ACTION_SHOW_ARCHIVED");
    let hideArchivedText = $translate.instant("KANBAN.ACTION_HIDE_ARCHIVED");

    let link = function($scope, $el, $attrs) {
        let status = $scope.$eval($attrs.tgKanbanArchivedStatusHeader);
        let hidden = true;

        kanbanUserstoriesService.addArchivedStatus(status.id);
        kanbanUserstoriesService.hideStatus(status.id);

        $scope.class = "icon-watch";
        $scope.title = showArchivedText;

        $el.on("click", function(event) {
            hidden = !hidden;

            return $scope.$apply(function() {
                if (hidden) {
                    $scope.class = "icon-watch";
                    $scope.title = showArchivedText;
                    $rootscope.$broadcast("kanban:hide-userstories-for-status", status.id);

                    return kanbanUserstoriesService.hideStatus(status.id);
                } else {
                    $scope.class = "icon-unwatch";
                    $scope.title = hideArchivedText;
                    $rootscope.$broadcast("kanban:show-userstories-for-status", status.id);

                    return kanbanUserstoriesService.showStatus(status.id);
                }
            });
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgKanbanArchivedStatusHeader", [ "$rootScope", "$translate", "tgKanbanUserstories", KanbanArchivedStatusHeaderDirective]);


//############################################################################
//# Kanban Archived Status Column Intro Directive
//############################################################################

let KanbanArchivedStatusIntroDirective = function($translate, kanbanUserstoriesService) {
    let userStories = [];

    let link = function($scope, $el, $attrs) {
        let hiddenUserStoriexText = $translate.instant("KANBAN.HIDDEN_USER_STORIES");
        let status = $scope.$eval($attrs.tgKanbanArchivedStatusIntro);
        $el.text(hiddenUserStoriexText);

        let updateIntroText = function(hasArchived) {
            if (hasArchived) {
                return $el.text("");
            } else {
                return $el.text(hiddenUserStoriexText);
            }
        };

        $scope.$on("kanban:us:move", function(ctx, itemUs, oldStatusId, newStatusId, itemIndex) {
            let hasArchived = !!kanbanUserstoriesService.getStatus(newStatusId).length;
            return updateIntroText(hasArchived);
        });

        $scope.$on("kanban:shown-userstories-for-status", function(ctx, statusId, userStoriesLoaded) {
            if (statusId === status.id) {
                kanbanUserstoriesService.deleteStatus(statusId);
                kanbanUserstoriesService.add(userStoriesLoaded);

                let hasArchived = !!kanbanUserstoriesService.getStatus(statusId).length;
                return updateIntroText(hasArchived);
            }
        });

        $scope.$on("kanban:hidden-userstories-for-status", function(ctx, statusId) {
            if (statusId === status.id) {
                return updateIntroText(false);
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgKanbanArchivedStatusIntro", ["$translate", "tgKanbanUserstories", KanbanArchivedStatusIntroDirective]);

//############################################################################
//# Kanban Squish Column Directive
//############################################################################

let KanbanSquishColumnDirective = function(rs, projectService) {
    let link = function($scope, $el, $attrs) {
        let unwatch;
        $scope.foldStatus = function(status) {
            $scope.folds[status.id] = !!!$scope.folds[status.id];
            rs.kanban.storeStatusColumnModes($scope.projectId, $scope.folds);
            updateTableWidth();
        };

        var updateTableWidth = function() {
            let columnWidths = _.map($scope.usStatusList, function(status:any) {
                if ($scope.folds[status.id]) {
                    return 40;
                } else {
                    return 310;
                }
            });

            let totalWidth = _.reduce(columnWidths, (total:number, width:number) => total + width);

            return $el.find('.kanban-table-inner').css("width", totalWidth);
        };

        return unwatch = $scope.$watch('usByStatus', function(usByStatus) {
            if (usByStatus.size) {
                $scope.folds = rs.kanban.getStatusColumnModes(projectService.project.get('id'));
                updateTableWidth();

                return unwatch();
            }
        });
    };

    return {link};
};

module.directive("tgKanbanSquishColumn", ["$tgResources", "tgProjectService", KanbanSquishColumnDirective]);

//############################################################################
//# Kanban WIP Limit Directive
//############################################################################

let KanbanWipLimitDirective = function() {
    let link = function($scope, $el, $attrs) {
        let status = $scope.$eval($attrs.tgKanbanWipLimit);

        let redrawWipLimit = () => {
            $el.find(".kanban-wip-limit").remove();
            return timeout(200, () => {
                let element = $el.find("tg-card")[status.wip_limit];
                if (element) {
                    return angular.element(element).before("<div class='kanban-wip-limit'></div>");
                }
            });
        };

        if (status && !status.is_archived) {
            $scope.$on("redraw:wip", redrawWipLimit);
            $scope.$on("kanban:us:move", redrawWipLimit);
            $scope.$on("usform:new:success", redrawWipLimit);
            $scope.$on("usform:bulk:success", redrawWipLimit);
        }

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgKanbanWipLimit", KanbanWipLimitDirective);
