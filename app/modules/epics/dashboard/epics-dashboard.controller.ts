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
 * File: epics.dashboard.controller.coffee
 */

let { taiga } = this;


class EpicsDashboardController {
    static initClass() {
        this.$inject = [
            "$routeParams",
            "tgErrorHandlingService",
            "tgLightboxFactory",
            "lightboxService",
            "$tgConfirm",
            "tgProjectService",
            "tgEpicsService",
            "tgAppMetaService",
            "$translate"
        ];
    }

    constructor(params, errorHandlingService, lightboxFactory, lightboxService,
                  confirm, projectService, epicsService, appMetaService, translate) {

        this.params = params;
        this.errorHandlingService = errorHandlingService;
        this.lightboxFactory = lightboxFactory;
        this.lightboxService = lightboxService;
        this.confirm = confirm;
        this.projectService = projectService;
        this.epicsService = epicsService;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.sectionName = "EPICS.SECTION_NAME";

        taiga.defineImmutableProperty(this, 'project', () => { return this.projectService.project; });
        taiga.defineImmutableProperty(this, 'epics', () => { return this.epicsService.epics; });

        this.appMetaService.setfn(this._setMeta.bind(this));
    }

    _setMeta() {
        if (!this.project) { return null; }

        let ctx = {
            projectName: this.project.get("name"),
            projectDescription: this.project.get("description")
        };

        return {
            title: this.translate.instant("EPICS.PAGE_TITLE", ctx),
            description: this.translate.instant("EPICS.PAGE_DESCRIPTION", ctx)
        };
    }

    loadInitialData() {
        this.epicsService.clear();
        return this.projectService.setProjectBySlug(this.params.pslug)
            .then(() => {
                if (!this.projectService.isEpicsDashboardEnabled()) {
                    return this.errorHandlingService.notFound();
                }
                if (!this.projectService.hasPermission("view_epics")) {
                    return this.errorHandlingService.permissionDenied();
                }

                return this.epicsService.fetchEpics();
        });
    }

    canCreateEpics() {
        return this.projectService.hasPermission("add_epic");
    }

    onCreateEpic() {
        let onCreateEpic =  () => {
            this.lightboxService.closeAll();
            this.confirm.notify("success");
             // To prevent error https://docs.angularjs.org/error/$parse/isecdom?p0=onCreateEpic()
        };

        return this.lightboxFactory.create('tg-create-epic', {
            "class": "lightbox lightbox-create-epic open",
            "on-create-epic": "onCreateEpic()"
        }, {
            "onCreateEpic": onCreateEpic.bind(this)
        });
    }
}
EpicsDashboardController.initClass();

angular.module("taigaEpics").controller("EpicsDashboardCtrl", EpicsDashboardController);
