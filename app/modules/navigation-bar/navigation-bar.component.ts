/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
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
 * File: navigation-bar.directive.coffee
 */

import {Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import {defineImmutableProperty} from "../../libs/utils";
import { ConfigurationService } from "../../ts/modules/base/conf";
import { NavigationUrlsService } from "../../ts/modules/base/navurls.service";
import { CurrentUserService } from "../services/current-user.service";
import { NavigationBarService } from "./navigation-bar.service";

@Component({
    selector: "tg-navigation-bar",
    template: require("./navigation-bar.pug")(),
})
export class NavigationBar implements OnInit{
    @Input() projects: any;
    @Input() user: any;
    @Output() logout: EventEmitter<any>;
    @Output() login: EventEmitter<any>;
    @Output() feedback: EventEmitter<any>;
    isAuthenticated: any = true;
    isEnabledHeader: any = true;
    // publicRegisterEnabled: any;
    // active: boolean;

    constructor() {
        this.login = new EventEmitter();
        this.logout = new EventEmitter();
        this.feedback = new EventEmitter();
    }
    // constructor(private navigationBarService: NavigationBarService,
    //             private router: Router,
    //             private navurls: NavigationUrlsService,
    //             private config: ConfigurationService) {
    //    }

    ngOnInit() {
        // console.log("INIT")
        // defineImmutableProperty(this, "projects", () => this.currentUser.projects.get("recents"));
        // defineImmutableProperty(this, "isAuthenticated", () => this.currentUser.isAuthenticated());
        // defineImmutableProperty(this, "isEnabledHeader", () => this.navigationBarService.isEnabledHeader());
        // this.publicRegisterEnabled = this.config.get("publicRegisterEnabled");
        //
        // // TODO: React to url change
        // if (this.router.url === "/") {
        //     return this.active = true;
        // } else {
        //     return this.active = false;
        // }
    }
}
