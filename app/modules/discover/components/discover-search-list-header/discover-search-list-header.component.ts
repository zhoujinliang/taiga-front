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
 * File: discover-search-list-header.controller.coffee
 */

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import * as angular from "angular";

@Component({
    selector: "tg-discover-search-list-header",
    template: require("./discover-search-list-header.pug")(),
})
export class DiscoverSearchListHeader implements OnInit {
    @Input("order-by") orderBy: any;
    @Output("order-by") orderByChange: EventEmitter<string>;
    like_is_open: boolean;
    activity_is_open: boolean;

    constructor() {
        this.orderByChange = new EventEmitter();
    }

    ngOnInit() {
        this.like_is_open = this.orderBy.indexOf("-total_fans") === 0;
        this.activity_is_open = this.orderBy.indexOf("-total_activity") === 0;
    }

    openLike() {
        this.activity_is_open = false;
        this.like_is_open = true;

        this.orderByChange.emit("-total_fans_last_week");
        return false;
    }

    openActivity() {
        this.activity_is_open = true;
        this.like_is_open = false;

        this.orderByChange.emit("-total_activity_last_week");
        return false;
    }

    setOrder(order) {
        this.orderByChange.emit(order);
    }

    clearOrder() {
        this.activity_is_open = false;
        this.like_is_open = false;

        this.orderByChange.emit(null);
    }
}
