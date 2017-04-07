/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: discover-search.controller.coffee
 */

class DiscoverSearchController {
    static initClass() {
        this.$inject = [
            '$routeParams',
            'tgDiscoverProjectsService',
            '$route',
            'tgAppMetaService',
            '$translate'
        ];
    }

    constructor(routeParams, discoverProjectsService, route, appMetaService, translate) {
        this.routeParams = routeParams;
        this.discoverProjectsService = discoverProjectsService;
        this.route = route;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.page = 1;

        taiga.defineImmutableProperty(this, "searchResult", () => { return this.discoverProjectsService.searchResult; });
        taiga.defineImmutableProperty(this, "nextSearchPage", () => { return this.discoverProjectsService.nextSearchPage; });

        this.q = this.routeParams.text;
        this.filter = this.routeParams.filter || 'all';
        this.orderBy = this.routeParams['order_by'] || '';

        this.loadingGlobal = false;
        this.loadingList = false;
        this.loadingPagination = false;

        let title = this.translate.instant("DISCOVER.SEARCH.PAGE_TITLE");
        let description = this.translate.instant("DISCOVER.SEARCH.PAGE_DESCRIPTION");
        this.appMetaService.setAll(title, description);
    }

    fetch() {
        this.page = 1;

        this.discoverProjectsService.resetSearchList();

        return this.search();
    }

    fetchByGlobalSearch() {
        if (this.loadingGlobal) { return; }

        this.loadingGlobal = true;

        return this.fetch().then(() => this.loadingGlobal = false);
    }

    fetchByOrderBy() {
        if (this.loadingList) { return; }

        this.loadingList = true;

        return this.fetch().then(() => this.loadingList = false);
    }

    showMore() {
        if (this.loadingPagination) { return; }

        this.loadingPagination = true;

        this.page++;

        return this.search().then(() => this.loadingPagination = false);
    }

    search() {
        let filter = this.getFilter();

        let params = {
            page: this.page,
            q: this.q,
            order_by: this.orderBy
        };

        _.assign(params, filter);

        return this.discoverProjectsService.fetchSearch(params);
    }

    getFilter() {
        if (this.filter === 'people') {
            return {is_looking_for_people: true};
        } else if (this.filter === 'scrum') {
            return {is_backlog_activated: true};
        } else if (this.filter === 'kanban') {
            return {is_kanban_activated: true};
        }

        return {};
    }

    onChangeFilter(filter, q) {
        this.filter = filter;
        this.q = q;

        this.route.updateParams({
            filter: this.filter,
            text: this.q
        });

        return this.fetchByGlobalSearch();
    }

    onChangeOrder(orderBy) {
        this.orderBy = orderBy;

        this.route.updateParams({
            order_by: orderBy
        });

        return this.fetchByOrderBy();
    }
}
DiscoverSearchController.initClass();

angular.module("taigaDiscover").controller("DiscoverSearch", DiscoverSearchController);
