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
 * File: filter.controller.coffee
 */

import {Component, EventEmitter, Input, Output, OnChanges} from "@angular/core";
import {Store} from "@ngrx/store";
import * as _ from "lodash";
import * as Immutable from "immutable";
import {IState} from "../../app.store";
import * as actions from "./filter.actions";

@Component({
    selector: "tg-filter",
    template: require("./filter.pug")(),
})
export class Filter implements OnChanges {
    @Input() appliedFilters: any;
    @Input() appliedFiltersList: any;
    @Input() section: string;
    @Input() filters: any;
    @Output() selectFilter: EventEmitter<any>;
    @Output() removeFilter: EventEmitter<any>;
    selectedCategory: string = "";
    statusesFilters: Immutable.List<any>;
    tagsFilters: Immutable.List<any>;
    notEmptyTags: number;
    assignedToFilters: Immutable.List<any>;
    ownersFilters: Immutable.List<any>;
    epicsFilters: Immutable.List<any>;

    constructor(private store: Store<IState>) {
        this.selectFilter = new EventEmitter();
        this.removeFilter = new EventEmitter();
    }

    ngOnChanges(changes) {
        if (changes.filters && this.filters) {
            this.statusesFilters = this.reformatStatuses(this.filters.get('statuses'));
            this.tagsFilters = this.reformatTags(this.filters.get('tags'));
            this.notEmptyTags = this.totalNotEmptyTags(this.filters.get('tags'));
            this.assignedToFilters = this.reformatAssignedTo(this.filters.get('assigned_to'));
            this.ownersFilters = this.reformatOwners(this.filters.get('owners'));
            this.epicsFilters = this.reformatEpics(this.filters.get('epics'));
        }
    }

    changeQ(q) {
        this.store.dispatch(new actions.SetFiltersAction(this.section, "q", q));
    }

    selectCategory(category) {
        if (this.selectedCategory === category) {
            this.selectedCategory = "";
        } else {
            this.selectedCategory = category;
        }
    }

    reformatStatuses(data) {
        return data.map((s) => s.update('id', (id) => id.toString()));
    }

    reformatTags(data) {
        return data.map((tag) => tag.update('id', () => tag.get('name')));
    }

    totalNotEmptyTags(tags) {
        if(tags) {
            return tags.filter((tag) => tag.count > 0).size;
        }
        return 0;
    }

    reformatAssignedTo(data) {
        return data.map((user) => {
            return user.update("id", (id) => id ? id.toString() : "null")
                       .update("name", () => user.get("full_name") || "Undefined");
        });
    }

    reformatOwners(data) {
        return data.map((owner) => {
            return owner.update("id", (id) => id.toString())
                        .update("name", () => owner.get("full_name"));
        });
    }

    reformatEpics(data) {
        return data.map((epic) => {
            if (epic.get("id")) {
                return epic.update("id", (id) => id.toString())
                           .update("name", () => `#${epic.get("ref")} ${epic.get("subject")}`);
            }
            return epic.update("id", (id) => "null")
                       .update("name", () => "Not in an epic"); // TODO TRANSLATE IT?
        });
    }
}
