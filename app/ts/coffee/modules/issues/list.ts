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
 * File: modules/issues/list.coffee
 */

let { taiga } = this;

let { mixOf } = this.taiga;
let { trim } = this.taiga;
let { toString } = this.taiga;
let { joinStr } = this.taiga;
let { groupBy } = this.taiga;
let { bindOnce } = this.taiga;
let { debounceLeading } = this.taiga;
let { startswith } = this.taiga;
let { bindMethods } = this.taiga;

let module = angular.module("taigaIssues");

//############################################################################
//# Issues Controller
//############################################################################

class IssuesController extends mixOf(taiga.Controller, taiga.PageMixin, taiga.FiltersMixin) {
    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$tgUrls",
            "$routeParams",
            "$q",
            "$tgLocation",
            "tgAppMetaService",
            "$tgNavUrls",
            "$tgEvents",
            "$tgAnalytics",
            "$translate",
            "tgErrorHandlingService",
            "$tgStorage",
            "tgFilterRemoteStorageService",
            "tgProjectService",
            "tgUserActivityService"
        ];
    
        this.prototype.filtersHashSuffix = "issues-filters";
        this.prototype.myFiltersHashSuffix = "issues-my-filters";
    
        // We need to guarantee that the last petition done here is the finally used
        // When searching by text loadIssues can be called fastly with different parameters and
        // can be resolved in a different order than generated
        // We count the requests made and only if the callback is for the last one data is updated
        this.prototype.loadIssuesRequests = 0;
    }

    constructor(scope, rootscope, repo, confirm, rs, urls, params, q, location, appMetaService,
                  navUrls, events, analytics, translate, errorHandlingService, storage, filterRemoteStorageService, projectService) {
        this.loadIssues = this.loadIssues.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.urls = urls;
        this.params = params;
        this.q = q;
        this.location = location;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.events = events;
        this.analytics = analytics;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.storage = storage;
        this.filterRemoteStorageService = filterRemoteStorageService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = "Issues";
        this.voting = false;

        if (this.applyStoredFilters(this.params.pslug, this.filtersHashSuffix)) { return; }

        let promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            let title = this.translate.instant("ISSUES.PAGE_TITLE", {projectName: this.scope.project.name});
            let description = this.translate.instant("ISSUES.PAGE_DESCRIPTION", {
                projectName: this.scope.project.name,
                projectDescription: this.scope.project.description
            });
            return this.appMetaService.setAll(title, description);
        });

        // On Error
        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("issueform:new:success", () => {
            this.analytics.trackEvent("issue", "create", "create issue on issues list", 1);
            return this.loadIssues();
        });
    }

    changeQ(q) {
        this.unselectFilter("page");
        this.replaceFilter("q", q);
        this.loadIssues();
        return this.generateFilters();
    }

    removeFilter(filter) {
        this.unselectFilter("page");
        this.unselectFilter(filter.dataType, filter.id);
        this.loadIssues();
        return this.generateFilters();
    }

    addFilter(newFilter) {
        this.unselectFilter("page");
        this.selectFilter(newFilter.category.dataType, newFilter.filter.id);
        this.loadIssues();
        return this.generateFilters();
    }

    selectCustomFilter(customFilter) {
        let orderBy = this.location.search().order_by;

        if (orderBy) {
            customFilter.filter.order_by = orderBy;
        }

        this.unselectFilter("page");
        this.replaceAllFilters(customFilter.filter);
        this.loadIssues();
        return this.generateFilters();
    }

    removeCustomFilter(customFilter) {
        return this.filterRemoteStorageService.getFilters(this.scope.projectId, this.myFiltersHashSuffix).then(userFilters => {
            delete userFilters[customFilter.id];
            return this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, this.myFiltersHashSuffix).then(this.generateFilters);
        });
    }

    saveCustomFilter(name) {
        let filters = {};
        let urlfilters = this.location.search();
        filters.tags = urlfilters.tags;
        filters.status = urlfilters.status;
        filters.type = urlfilters.type;
        filters.severity = urlfilters.severity;
        filters.priority = urlfilters.priority;
        filters.assigned_to = urlfilters.assigned_to;
        filters.owner = urlfilters.owner;

        return this.filterRemoteStorageService.getFilters(this.scope.projectId, this.myFiltersHashSuffix).then(userFilters => {
            userFilters[name] = filters;

            return this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, this.myFiltersHashSuffix).then(this.generateFilters);
        });
    }

    generateFilters() {
        this.storeFilters(this.params.pslug, this.location.search(), this.filtersHashSuffix);

        let urlfilters = this.location.search();

        let loadFilters = {};
        loadFilters.project = this.scope.projectId;
        loadFilters.tags = urlfilters.tags;
        loadFilters.status = urlfilters.status;
        loadFilters.type = urlfilters.type;
        loadFilters.severity = urlfilters.severity;
        loadFilters.priority = urlfilters.priority;
        loadFilters.assigned_to = urlfilters.assigned_to;
        loadFilters.owner = urlfilters.owner;
        loadFilters.q = urlfilters.q;

        return this.q.all([
            this.rs.issues.filtersData(loadFilters),
            this.filterRemoteStorageService.getFilters(this.scope.projectId, this.myFiltersHashSuffix)
        ]).then(result => {
            let selected;
            let data = result[0];
            let customFiltersRaw = result[1];

            let statuses = _.map(data.statuses, function(it) {
                it.id = it.id.toString();

                return it;
            });
            let type = _.map(data.types, function(it) {
                it.id = it.id.toString();

                return it;
            });
            let severity = _.map(data.severities, function(it) {
                it.id = it.id.toString();

                return it;
            });
            let priority = _.map(data.priorities, function(it) {
                it.id = it.id.toString();

                return it;
            });
            let tags = _.map(data.tags, function(it) {
                it.id = it.name;

                return it;
            });

            let tagsWithAtLeastOneElement = _.filter(tags, tag => tag.count > 0);

            let assignedTo = _.map(data.assigned_to, function(it) {
                if (it.id) {
                    it.id = it.id.toString();
                } else {
                    it.id = "null";
                }

                it.name = it.full_name || "Unassigned";

                return it;
            });
            let owner = _.map(data.owners, function(it) {
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

            if (loadFilters.type) {
                selected = this.formatSelectedFilters("type", type, loadFilters.type);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            if (loadFilters.severity) {
                selected = this.formatSelectedFilters("severity", severity, loadFilters.severity);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            if (loadFilters.priority) {
                selected = this.formatSelectedFilters("priority", priority, loadFilters.priority);
                this.selectedFilters = this.selectedFilters.concat(selected);
            }

            this.filterQ = loadFilters.q;

            this.filters = [
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.TYPE"),
                    dataType: "type",
                    content: type
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.SEVERITY"),
                    dataType: "severity",
                    content: severity
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.PRIORITIES"),
                    dataType: "priority",
                    content: priority
                },
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

    initializeSubscription() {
        let routingKey = `changes.project.${this.scope.projectId}.issues`;
        return this.events.subscribe(this.scope, routingKey, message => {
            return this.loadIssues();
        });
    }


    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.is_issues_activated) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);

        this.scope.issueStatusById = groupBy(project.issue_statuses, x => x.id);
        this.scope.issueStatusList = _.sortBy(project.issue_statuses, "order");
        this.scope.severityById = groupBy(project.severities, x => x.id);
        this.scope.severityList = _.sortBy(project.severities, "order");
        this.scope.priorityById = groupBy(project.priorities, x => x.id);
        this.scope.priorityList = _.sortBy(project.priorities, "order");
        this.scope.issueTypes = _.sortBy(project.issue_types, "order");
        this.scope.issueTypeById = groupBy(project.issue_types, x => x.id);

        return project;
    }
    loadIssues() {
        let params = this.location.search();

        let promise = this.rs.issues.list(this.scope.projectId, params);
        this.loadIssuesRequests += 1;
        promise.index = this.loadIssuesRequests;
        promise.then(data => {
            if (promise.index === this.loadIssuesRequests) {
                this.scope.issues = data.models;
                this.scope.page = data.current;
                this.scope.count = data.count;
                this.scope.paginatedBy = data.paginatedBy;
            }

            return data;
        });

        return promise;
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        this.initializeSubscription();
        this.generateFilters();

        return this.loadIssues();
    }

    // Functions used from templates
    addNewIssue() {
        return this.rootscope.$broadcast("issueform:new", this.scope.project);
    }

    addIssuesInBulk() {
        return this.rootscope.$broadcast("issueform:bulk", this.scope.projectId);
    }

    upVoteIssue(issueId) {
        this.voting = issueId;
        let onSuccess = () => {
            this.loadIssues();
            return this.voting = null;
        };
        let onError = () => {
            this.confirm.notify("error");
            return this.voting = null;
        };

        return this.rs.issues.upvote(issueId).then(onSuccess, onError);
    }

    downVoteIssue(issueId) {
        this.voting = issueId;
        let onSuccess = () => {
            this.loadIssues();
            return this.voting = null;
        };
        let onError = () => {
            this.confirm.notify("error");
            return this.voting = null;
        };

        return this.rs.issues.downvote(issueId).then(onSuccess, onError);
    }

    getOrderBy() {
        if (_.isString(this.location.search().order_by)) {
            return this.location.search().order_by;
        } else {
            return "created_date";
        }
    }
}
IssuesController.initClass();

module.controller("IssuesController", IssuesController);

//############################################################################
//# Issues Directive
//############################################################################

let IssuesDirective = function($log, $location, $template, $compile) {
    //# Issues Pagination
    let template = $template.get("issue/issue-paginator.html", true);

    let linkPagination = function($scope, $el, $attrs, $ctrl) {
        // Constants
        let afterCurrent = 2;
        let beforeCurrent = 4;
        let atBegin = 2;
        let atEnd = 2;

        let $pagEl = $el.find(".issues-paginator");

        let getNumPages = function() {
            let numPages = $scope.count / $scope.paginatedBy;
            if (parseInt(numPages, 10) < numPages) {
                numPages = parseInt(numPages, 10) + 1;
            } else {
                numPages = parseInt(numPages, 10);
            }

            return numPages;
        };

        let renderPagination = function() {
            let numPages = getNumPages();

            if (numPages <= 1) {
                $pagEl.hide();
                return;
            }
            $pagEl.show();

            let pages = [];
            let options = {};
            options.pages = pages;
            options.showPrevious = ($scope.page > 1);
            options.showNext = !($scope.page === numPages);

            let cpage = $scope.page;

            for (let i = 1, end = numPages, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                if ((i === (cpage + afterCurrent)) && (numPages > (cpage + afterCurrent + atEnd))) {
                    pages.push({classes: "dots", type: "dots"});
                } else if ((i === (cpage - beforeCurrent)) && (cpage > (atBegin + beforeCurrent))) {
                    pages.push({classes: "dots", type: "dots"});
                } else if ((i > (cpage + afterCurrent)) && (i <= (numPages - atEnd))) {
                } else if ((i < (cpage - beforeCurrent)) && (i > atBegin)) {
                } else if (i === cpage) {
                    pages.push({classes: "active", num: i, type: "page-active"});
                } else {
                    pages.push({classes: "page", num: i, type: "page"});
                }
            }


            let html = template(options);
            html = $compile(html)($scope);

            return $pagEl.html(html);
        };

        $scope.$watch("issues", function(value) {
            // Do nothing if value is not logical true
            if (!value) { return; }

            return renderPagination();
        });

        $el.on("click", ".issues-paginator a.next", function(event) {
            event.preventDefault();

            return $scope.$apply(function() {
                $ctrl.selectFilter("page", $scope.page + 1);
                return $ctrl.loadIssues();
            });
        });

        $el.on("click", ".issues-paginator a.previous", function(event) {
            event.preventDefault();
            return $scope.$apply(function() {
                $ctrl.selectFilter("page", $scope.page - 1);
                return $ctrl.loadIssues();
            });
        });

        return $el.on("click", ".issues-paginator li.page > a", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let pagenum = target.data("pagenum");

            return $scope.$apply(function() {
                $ctrl.selectFilter("page", pagenum);
                return $ctrl.loadIssues();
            });
        });
    };

    //# Issues Filters
    let linkOrdering = function($scope, $el, $attrs, $ctrl) {
        // Draw the arrow the first time

        let icon, svg;
        let currentOrder = $ctrl.getOrderBy();

        if (currentOrder) {
            icon = startswith(currentOrder, "-") ? "icon-arrow-up" : "icon-arrow-down";
            let colHeadElement = $el.find(`.row.title > div[data-fieldname='${trim(currentOrder, "-")}']`);

            svg = $("<tg-svg>").attr("svg-icon", icon);

            colHeadElement.append(svg);
            $compile(colHeadElement.contents())($scope);
        }

        return $el.on("click", ".row.title > div", function(event) {
            let finalOrder;
            let target = angular.element(event.currentTarget);

            currentOrder = $ctrl.getOrderBy();
            let newOrder = target.data("fieldname");

            if (newOrder === 'total_voters') {
                finalOrder = currentOrder === newOrder ? newOrder : `-${newOrder}`;
            } else {
                finalOrder = currentOrder === newOrder ? `-${newOrder}` : newOrder;
            }

            return $scope.$apply(function() {
                $ctrl.replaceFilter("order_by", finalOrder);

                $ctrl.storeFilters($ctrl.params.pslug, $location.search(), $ctrl.filtersHashSuffix);
                return $ctrl.loadIssues().then(function() {
                    // Update the arrow
                    $el.find(".row.title > div > tg-svg").remove();
                    icon = startswith(finalOrder, "-") ? "icon-arrow-up" : "icon-arrow-down";

                    svg = $("<tg-svg>")
                        .attr("svg-icon", icon);

                    target.append(svg);
                    return $compile(target.contents())($scope);
                });
            });
        });
    };

    //# Issues Link
    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        linkOrdering($scope, $el, $attrs, $ctrl);
        linkPagination($scope, $el, $attrs, $ctrl);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgIssues", ["$log", "$tgLocation", "$tgTemplate", "$compile", IssuesDirective]);


//############################################################################
//# Issue status Directive (popover for change status)
//############################################################################

let IssueStatusInlineEditionDirective = function($repo, $template, $rootscope) {
    /*
    Print the status of an Issue and a popover to change it.
    - tg-issue-status-inline-edition: The issue

    Example:

      div.status(tg-issue-status-inline-edition="issue")
        a.issue-status(href="")

    NOTE: This directive need 'issueStatusById' and 'project'.
    */
    let selectionTemplate = $template.get("issue/issue-status-inline-edition-selection.html", true);

    let updateIssueStatus = function($el, issue, issueStatusById) {
        let issueStatusDomParent = $el.find(".issue-status");
        let issueStatusDom = $el.find(".issue-status .issue-status-bind");

        let status = issueStatusById[issue.status];

        if (status) {
            issueStatusDom.text(status.name);
            issueStatusDom.prop("title", status.name);
            return issueStatusDomParent.css('color', status.color);
        }
    };

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        let issue = $scope.$eval($attrs.tgIssueStatusInlineEdition);

        $el.on("click", ".issue-status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            return $el.find(".pop-status").popover().open();
        });

        $el.on("click", ".status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            let target = angular.element(event.currentTarget);

            issue.status = target.data("status-id");
            $el.find(".pop-status").popover().close();
            updateIssueStatus($el, issue, $scope.issueStatusById);

            return $scope.$apply(() =>
                $repo.save(issue).then(function() {
                    $ctrl.loadIssues();
                    return $ctrl.generateFilters();
                })
            );
        });

        taiga.bindOnce($scope, "project", function(project) {
            $el.append(selectionTemplate({ 'statuses':  project.issue_statuses }));
            updateIssueStatus($el, issue, $scope.issueStatusById);

            // If the user has not enough permissions the click events are unbinded
            if (project.my_permissions.indexOf("modify_issue") === -1) {
                $el.unbind("click");
                return $el.find("a").addClass("not-clickable");
            }
        });

        $scope.$watch($attrs.tgIssueStatusInlineEdition, val => {
            return updateIssueStatus($el, val, $scope.issueStatusById);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgIssueStatusInlineEdition", ["$tgRepo", "$tgTemplate", "$rootScope",
                                                IssueStatusInlineEditionDirective]);


//############################################################################
//# Issue assigned to Directive
//############################################################################

let IssueAssignedToInlineEditionDirective = function($repo, $rootscope, $translate, avatarService) {
    let template = _.template(`\
<img style="background-color: <%- bg %>" src="<%- imgurl %>" alt="<%- name %>"/>
<figcaption><%- name %></figcaption>\
`);

    let link = function($scope, $el, $attrs) {
        let updateIssue = function(issue) {
            let ctx = {
                name: $translate.instant("COMMON.ASSIGNED_TO.NOT_ASSIGNED"),
                imgurl: `/${window._version}/images/unnamed.png`
            };

            let member = $scope.usersById[issue.assigned_to];

            let avatar = avatarService.getAvatar(member);
            ctx.imgurl = avatar.url;
            ctx.bg = null;

            if (member) {
                ctx.name = member.full_name_display;
                ctx.bg = avatar.bg;
            }

            $el.find(".avatar").html(template(ctx));
            return $el.find(".issue-assignedto").attr('title', ctx.name);
        };

        let $ctrl = $el.controller();
        let issue = $scope.$eval($attrs.tgIssueAssignedToInlineEdition);
        updateIssue(issue);

        $el.on("click", ".issue-assignedto", event => $rootscope.$broadcast("assigned-to:add", issue));

        taiga.bindOnce($scope, "project", function(project) {
            // If the user has not enough permissions the click events are unbinded
            if (project.my_permissions.indexOf("modify_issue") === -1) {
                $el.unbind("click");
                return $el.find("a").addClass("not-clickable");
            }
        });

        $scope.$on("assigned-to:added", (ctx, userId, updatedIssue) => {
            if (updatedIssue.id === issue.id) {
                updatedIssue.assigned_to = userId;
                $repo.save(updatedIssue);
                return updateIssue(updatedIssue);
            }
        });

        $scope.$watch($attrs.tgIssueAssignedToInlineEdition, val => {
            return updateIssue(val);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgIssueAssignedToInlineEdition", ["$tgRepo", "$rootScope", "$translate", "tgAvatarService",
                                                    IssueAssignedToInlineEditionDirective]);
