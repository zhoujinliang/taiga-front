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
 * File: lb-contact-team.controller.coffee
 */

export class ContactProjectLbController {
    lightboxService:any
    rs:any
    confirm:any
    contact:any
    project:any
    sendingFeedback:boolean

    static initClass() {
        this.$inject = [
            "lightboxService",
            "tgResources",
            "$tgConfirm",
        ];
    }

    constructor(lightboxService, rs, confirm) {
        this.lightboxService = lightboxService;
        this.rs = rs;
        this.confirm = confirm;
        this.contact = {};
    }

    contactProject() {
        let project = this.project.get('id');
        let { message } = this.contact;

        let promise = this.rs.projects.contactProject(project, message);
        this.sendingFeedback = true;
        return promise.then(() => {
            this.lightboxService.closeAll();
            this.sendingFeedback = false;
            return this.confirm.notify("success");
        });
    }
}
ContactProjectLbController.initClass();
