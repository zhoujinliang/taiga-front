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
 * File: project-menu.controller.coffee
 */

import {slugify} from "../../../libs/utils"
import * as _ from "lodash"
import * as Immutable from "immutable"
import {Component, Input, OnChanges} from "@angular/core"

@Component({
    selector: "tg-project-menu",
    template: require("./project-menu.jade")()
})
export class ProjectMenu implements OnChanges {
    @Input() project:any;
    menu:any;
    videoconferenceUrl:string;


    constructor() {}

    ngOnChanges() {
        if(this.project) {
            this._setMenu();
            this._setVideoConferenceUrl();
        }
    }

    _setMenu() {
        this.menu = Immutable.Map({
            epics: false,
            backlog: false,
            kanban: false,
            issues: false,
            wiki: false
        });
        if (this.project.get("is_epics_activated") && (this.project.get("my_permissions").indexOf("view_epics") !== -1)) {
            this.menu = this.menu.set("epics", true);
        }

        if (this.project.get("is_backlog_activated") && (this.project.get("my_permissions").indexOf("view_us") !== -1)) {
            this.menu = this.menu.set("backlog", true);
        }

        if (this.project.get("is_kanban_activated") && (this.project.get("my_permissions").indexOf("view_us") !== -1)) {
            this.menu = this.menu.set("kanban", true);
        }

        if (this.project.get("is_issues_activated") && (this.project.get("my_permissions").indexOf("view_issues") !== -1)) {
            this.menu = this.menu.set("issues", true);
        }

        if (this.project.get("is_wiki_activated") && (this.project.get("my_permissions").indexOf("view_wiki_pages") !== -1)) {
            this.menu = this.menu.set("wiki", true);
        }
    }

    search() {
        // TODO
        console.log("SEARCH")
    }

    _setVideoConferenceUrl() {
        // Get base url
        let baseUrl, url;
        if (this.project.get("videoconferences") === "appear-in") {
            baseUrl = "https://appear.in/";
        } else if (this.project.get("videoconferences") === "talky") {
            baseUrl = "https://talky.io/";
        } else if (this.project.get("videoconferences") === "jitsi") {
            baseUrl = "https://meet.jit.si/";
        } else if (this.project.get("videoconferences") === "custom") {
            this.videoconferenceUrl = this.project.get("videoconferences_extra_data");
            return;
        } else {
            this.videoconferenceUrl = "";
            return;
        }

        // Add prefix to the chat room name if exist
        if (this.project.get("videoconferences_extra_data")) {
            url = this.project.get("slug") + "-" + slugify(this.project.get("videoconferences_extra_data"));
        } else {
            url = this.project.get("slug");
        }

        // Some special cases
        if (this.project.get("videoconferences") === "jitsi") {
            url = url.replace(/-/g, "");
        }

        this.videoconferenceUrl = baseUrl + url;
    }
}
