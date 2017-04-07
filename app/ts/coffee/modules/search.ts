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
 * File: modules/search.coffee
 */

let { taiga } = this;

let { groupBy } = this.taiga;
let { bindOnce } = this.taiga;
let { mixOf } = this.taiga;
let { debounceLeading } = this.taiga;
let { trim } = this.taiga;
let { debounce } = this.taiga;

let module = angular.module("taigaSearch", []);


//############################################################################
//# Search Controller
//############################################################################

class SearchController extends mixOf(taiga.Controller, taiga.PageMixin) {
    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "tgAppMetaService",
            "$tgNavUrls",
            "$translate",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, q, location, appMetaService, navUrls, translate, errorHandlingService, projectService) {
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        this.scope.sectionName = "Search";

        this.loadInitialData();

        let title = this.translate.instant("SEARCH.PAGE_TITLE", {projectName: this.scope.project.name});
        let description = this.translate.instant("SEARCH.PAGE_DESCRIPTION", {
            projectName: this.scope.project.name,
            projectDescription: this.scope.project.description
        });

        this.appMetaService.setAll(title, description);

        // Search input watcher
        this.scope.searchTerm = null;
        let loadSearchData = debounceLeading(100, t => this.loadSearchData(t));

        bindOnce(this.scope, "projectId", projectId => {
            if (!this.scope.searchResults && this.scope.searchTerm) {
                return this.loadSearchData();
            }
        });

        this.scope.$watch("searchTerm", term => {
            if ((term !== undefined) && this.scope.projectId) {
                return this.loadSearchData(term);
            }
        });
    }

    loadFilters() {
        let defered = this.q.defer();
        defered.resolve();
        return defered.promise;
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.project = project;
        this.scope.$emit('project:loaded', project);

        this.scope.epicStatusById = groupBy(project.epic_statuses, x => x.id);
        this.scope.issueStatusById = groupBy(project.issue_statuses, x => x.id);
        this.scope.taskStatusById = groupBy(project.task_statuses, x => x.id);
        this.scope.severityById = groupBy(project.severities, x => x.id);
        this.scope.priorityById = groupBy(project.priorities, x => x.id);
        this.scope.usStatusById = groupBy(project.us_statuses, x => x.id);
        return project;
    }

    loadSearchData(term) {
        if (term == null) { term = ""; }
        this.scope.loading = true;

        return this._loadSearchData(term).then(data => {
            this.scope.searchResults = data;
            return this.scope.loading = false;
        });
    }

    _loadSearchData(term) {
        if (term == null) { term = ""; }
        if (this._promise) { this._promise.abort(); }

        this._promise = this.rs.search.do(this.scope.projectId, term);

        return this._promise;
    }

    loadInitialData() {
        let project = this.loadProject();

        this.scope.projectId = project.id;
        return this.fillUsersAndRoles(project.members, project.roles);
    }
}
SearchController.initClass();

module.controller("SearchController", SearchController);


//############################################################################
//# Search box directive
//############################################################################

let SearchBoxDirective = function(projectService, $lightboxService, $navurls, $location, $route){
    let link = function($scope, $el, $attrs) {
        let project = null;

        let submit = debounce(2000, event => {
            event.preventDefault();

            let form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            let text = $el.find("#search-text").val();

            let url = $navurls.resolve("project-search", {project: project.get("slug")});

            return $scope.$apply(function() {
                $lightboxService.close($el);

                $location.path(url);
                $location.search("text", text).path(url);
                return $route.reload();
            });
        });


        let openLightbox = function() {
            ({ project } = projectService);

            return $lightboxService.open($el).then(() => $el.find("#search-text").focus());
        };

        $el.on("submit", "form", submit);

        return openLightbox();
    };

    return {
        templateUrl: "search/lightbox-search.html",
        link
    };
};

SearchBoxDirective.$inject = [
    "tgProjectService",
    "lightboxService",
    "$tgNavUrls",
    "$tgLocation",
    "$route"
];

module.directive("tgSearchBox", SearchBoxDirective);


//############################################################################
//# Search Directive
//############################################################################

let SearchDirective = function($log, $compile, $templatecache, $routeparams, $location) {
    let linkTable = function($scope, $el, $attrs, $ctrl) {
        let applyAutoTab = true;
        let activeSectionName = "userstories";
        let tabsDom = $el.find(".search-filter");
        let lastSearchResults = null;

        let getActiveSection = function(data) {
            let maxVal = 0;
            let selectedSection = {};
            selectedSection.name = "userstories";
            selectedSection.value = [];

            if (!applyAutoTab) {
                selectedSection.name = activeSectionName;
                selectedSection.value = data[activeSectionName];

                return selectedSection;
            }

            if (data) {
                for (let name of ["userstories", "epics", "issues", "tasks", "wikipages"]) {
                    let value = data[name];

                    if (value.length > maxVal) {
                        maxVal = value.length;
                        selectedSection.name = name;
                        selectedSection.value = value;
                        break;
                    }
                }
            }

            if (maxVal === 0) {
                return selectedSection;
            }

            return selectedSection;
        };

        let renderFilterTabs = data =>
            (() => {
                let result = [];
                for (let name in data) {
                    let value = data[name];
                    tabsDom.find(`li.${name}`).show();
                    result.push(tabsDom.find(`li.${name} .num`).html(value.length));
                }
                return result;
            })()
        ;

        let markSectionTabActive = function(section) {
            // Mark as active the item with max amount of results
            tabsDom.find("a.active").removeClass("active");
            tabsDom.find(`li.${section.name} a`).addClass("active");

            applyAutoTab = false;
            return activeSectionName = section.name;
        };

        let templates = {
            epics: $templatecache.get("search-epics"),
            issues: $templatecache.get("search-issues"),
            tasks: $templatecache.get("search-tasks"),
            userstories: $templatecache.get("search-userstories"),
            wikipages: $templatecache.get("search-wikipages")
        };

        let renderTableContent = function(section) {
            let oldElements = $el.find(".search-result-table").children();
            let oldScope = oldElements.scope();

            if (oldScope) {
                oldScope.$destroy();
                oldElements.remove();
            }

            let scope = $scope.$new();
            scope[section.name] = section.value;

            let template = angular.element.parseHTML(trim(templates[section.name]));
            let element = $compile(template)(scope);
            return $el.find(".search-result-table").html(element);
        };

        $scope.$watch("searchResults", function(data) {
            lastSearchResults = data;

            if (!lastSearchResults) { return; }

            let activeSection = getActiveSection(data);

            renderFilterTabs(data);

            renderTableContent(activeSection);
            return markSectionTabActive(activeSection);
        });

        $scope.$watch("searchTerm", function(searchTerm) {
            if (searchTerm !== undefined) { return $location.search("text", searchTerm); }
        });

        return $el.on("click", ".search-filter li > a", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);

            let sectionName = target.parent().data("name");
            let sectionData = !lastSearchResults ? [] : lastSearchResults[sectionName];

            let section = {
                name: sectionName,
                value: sectionData
            };

            return $scope.$apply(function() {
                renderTableContent(section);
                return markSectionTabActive(section);
            });
        });
    };

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        linkTable($scope, $el, $attrs, $ctrl);

        let searchText = $routeparams.text;
        return $scope.$watch("projectId", function(projectId) {
            if (projectId != null) { return $scope.searchTerm =  searchText; }
        });
    };

    return {link};
};

module.directive("tgSearch", ["$log", "$compile", "$templateCache", "$routeParams", "$tgLocation",
                              SearchDirective]);
