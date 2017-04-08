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
 * File: modules/controllerMixins.coffee
 */

import * as _ from "lodash"
import {groupBy, joinStr, trim, toString} from "../utils"
import {generateHash} from "../app"
import {Controller} from "../classes"


//############################################################################
//# Page Mixin
//############################################################################

export class PageMixin extends Controller {
    scope:any
    q: any
    rs: any

    fillUsersAndRoles(users, roles) {
        let activeUsers = _.filter(users, (user:any) => user.is_active);
        this.scope.activeUsers = _.sortBy(activeUsers, "full_name_display");
        this.scope.activeUsersById = groupBy(this.scope.activeUsers, e => e.id);

        this.scope.users = _.sortBy(users, "full_name_display");
        this.scope.usersById = groupBy(this.scope.users, e => e.id);

        this.scope.roles = _.sortBy(roles, "order");
        let computableRoles = _(this.scope.project.members).map("role").uniq().value();
        return this.scope.computableRoles = _(roles).filter("computable")
                                         .filter((x:any) => _.includes(computableRoles, x.id))
                                         .value();
    }
    loadUsersAndRoles() {
        let promise = this.q.all([
            this.rs.projects.usersList(this.scope.projectId),
            this.rs.projects.rolesList(this.scope.projectId)
        ]);

        return promise.then(results => {
            let [users, roles] = Array.from(results);
            this.fillUsersAndRoles(users, roles);
            return results;
        });
    }
}


//############################################################################
//# Filters Mixin
//############################################################################
// This mixin requires @location ($tgLocation), and @scope

export class FiltersMixin extends PageMixin{
    location: any
    scope: any
    storage: any

    selectFilter(name, value, load=false) {
        let params = this.location.search();
        if ((params[name] !== undefined) && (name !== "page")) {
            let existing = _.map(toString(params[name]).split(","), x => trim(x));
            existing.push(toString(value));
            existing = _.compact(existing);
            value = joinStr(",", _.uniq(existing));
        }

        if (!this.location.isInCurrentRouteParams(name, value)) {
            let location = load ? this.location : this.location.noreload(this.scope);
            return location.search(name, value);
        }
    }

    replaceFilter(name, value, load=false) {
        if (!this.location.isInCurrentRouteParams(name, value)) {
            let location = load ? this.location : this.location.noreload(this.scope);
            return location.search(name, value);
        }
    }

    replaceAllFilters(filters, load=false) {
        let location = load ? this.location : this.location.noreload(this.scope);
        return location.search(filters);
    }

    unselectFilter(name, value, load=false) {
        let params = this.location.search();

        if (params[name] === undefined) {
            return;
        }

        if ((value === undefined) || (value === null)) {
            delete params[name];
        }

        let parsedValues = _.map(toString(params[name]).split(","), x => trim(x));
        let newValues = _.reject(parsedValues, x => x === toString(value));
        newValues = _.compact(newValues);

        if (_.isEmpty(newValues)) {
            value = null;
        } else {
            value = joinStr(",", _.uniq(newValues));
        }

        let location = load ? this.location : this.location.noreload(this.scope);
        return location.search(name, value);
    }

    applyStoredFilters(projectSlug, key) {
        if (_.isEmpty(this.location.search())) {
            let filters = this.getFilters(projectSlug, key);
            if (Object.keys(filters).length) {
                this.location.search(filters);
                this.location.replace();

                return true;
            }
        }

        return false;
    }

    storeFilters(projectSlug, params, filtersHashSuffix) {
        let ns = `${projectSlug}:${filtersHashSuffix}`;
        let hash = generateHash([projectSlug, ns]);
        return this.storage.set(hash, params);
    }

    getFilters(projectSlug, filtersHashSuffix) {
        let ns = `${projectSlug}:${filtersHashSuffix}`;
        let hash = generateHash([projectSlug, ns]);

        return this.storage.get(hash) || {};
    }

    formatSelectedFilters(type, list, urlIds) {
        let selectedIds = urlIds.split(',');
        let selectedFilters = _.filter(list, (it:any) => selectedIds.indexOf(_.toString(it.id)) !== -1);

        let invalidTags = _.filter(selectedIds, (it:any) => !_.find(selectedFilters, sit => _.toString(sit.id) === it));

        let invalidAppliedTags =  _.map(invalidTags, it =>
            ({
                id: it,
                key: type + ":" + it,
                dataType: type,
                name: it
            })
    );

        let validAppliedTags = _.map(selectedFilters, (it:any) =>
            ({
                id: it.id,
                key: type + ":" + it.id,
                dataType: type,
                name: it.name,
                color: it.color
            })
    );

        return invalidAppliedTags.concat(validAppliedTags);
    }
}

//############################################################################
//# Us Filters Mixin
//############################################################################

export class UsFiltersMixin extends FiltersMixin {
    filterRemoteStorageService:any
    storeCustomFiltersName:any
    storeFiltersName:any
    params:any
    selectedFilters:any
    filters:any
    filterQ:any
    customFilters:any
    translate:any

    filtersReloadContent() {
    }

    changeQ(q) {
        this.replaceFilter("q", q);
        this.filtersReloadContent();
        return this.generateFilters();
    }

    removeFilter(filter) {
        this.unselectFilter(filter.dataType, filter.id);
        this.filtersReloadContent();
        return this.generateFilters();
    }

    addFilter(newFilter) {
        this.selectFilter(newFilter.category.dataType, newFilter.filter.id);
        this.filtersReloadContent();
        return this.generateFilters();
    }

    selectCustomFilter(customFilter) {
        this.replaceAllFilters(customFilter.filter);
        this.filtersReloadContent();
        return this.generateFilters();
    }

    saveCustomFilter(name) {
        let filters:any = {};
        let urlfilters = this.location.search();
        filters.tags = urlfilters.tags;
        filters.status = urlfilters.status;
        filters.assigned_to = urlfilters.assigned_to;
        filters.owner = urlfilters.owner;

        return this.filterRemoteStorageService.getFilters(this.scope.projectId, this.storeCustomFiltersName).then(userFilters => {
            userFilters[name] = filters;

            return this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, this.storeCustomFiltersName).then(this.generateFilters);
        });
    }

    removeCustomFilter(customFilter) {
        return this.filterRemoteStorageService.getFilters(this.scope.projectId, this.storeCustomFiltersName).then(userFilters => {
            delete userFilters[customFilter.id];

            this.filterRemoteStorageService.storeFilters(this.scope.projectId, userFilters, this.storeCustomFiltersName).then(this.generateFilters);
            return this.generateFilters();
        });
    }

    generateFilters() {
        this.storeFilters(this.params.pslug, this.location.search(), this.storeFiltersName);

        let urlfilters = this.location.search();

        let loadFilters:any = {};
        loadFilters.project = this.scope.projectId;
        loadFilters.tags = urlfilters.tags;
        loadFilters.status = urlfilters.status;
        loadFilters.assigned_to = urlfilters.assigned_to;
        loadFilters.owner = urlfilters.owner;
        loadFilters.epic = urlfilters.epic;
        loadFilters.q = urlfilters.q;

        return this.q.all([
            this.rs.userstories.filtersData(loadFilters),
            this.filterRemoteStorageService.getFilters(this.scope.projectId, this.storeCustomFiltersName)
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
            let epic = _.map(data.epics, function(it:any) {
                if (it.id) {
                    it.id = it.id.toString();
                    it.name = `#${it.ref} ${it.subject}`;
                } else {
                    it.id = "null";
                    it.name = "Not in an epic";
                }

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

            if (loadFilters.epic) {
                selected = this.formatSelectedFilters("epic", epic, loadFilters.epic);
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
                },
                {
                    title: this.translate.instant("COMMON.FILTERS.CATEGORIES.EPIC"),
                    dataType: "epic",
                    content: epic
                }
            ];

            this.customFilters = [];
            return _.forOwn(customFiltersRaw, (value, key) => {
                return this.customFilters.push({id: key, name: key, filter: value});
            });
        });
    }
}
