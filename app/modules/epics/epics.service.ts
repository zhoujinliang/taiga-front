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
 * File: epics.service.coffee
 */

import * as angular from "angular";
import * as Promise from "bluebird";
import * as Immutable from "immutable";
import * as _ from "lodash";
import {defineImmutableProperty} from "../../libs/utils";

export class EpicsService {
    projectService: any;
    attachmentsService: any;
    resources: any;
    xhrError: any;
    _page: number;
    _loadingEpics: boolean;
    _disablePagination: boolean;
    _epics: any;
    epics: any;

    static initClass() {
        this.$inject = [
            "tgProjectService",
            "tgAttachmentsService",
            "tgResources",
            "tgXhrErrorService",
        ];
    }

    constructor(projectService, attachmentsService, resources, xhrError) {
        this.projectService = projectService;
        this.attachmentsService = attachmentsService;
        this.resources = resources;
        this.xhrError = xhrError;
        this.clear();

        defineImmutableProperty(this, "epics", () => this._epics);
    }

    clear() {
        this._loadingEpics = false;
        this._disablePagination = false;
        this._page = 1;
        return this._epics = Immutable.List();
    }

    fetchEpics(reset= false) {
        this._loadingEpics = true;
        this._disablePagination = true;

        return this.resources.epics.list(this.projectService.project.get("id"), this._page)
            .then((result) => {
                if (reset) {
                    this.clear();
                    this._epics = result.list;
                } else {
                    this._epics = this._epics.concat(result.list);
                }

                this._loadingEpics = false;

                return this._disablePagination = !result.headers["x-pagination-next"];
        }).catch((xhr) => {
                return this.xhrError.response(xhr);
        });
    }

    nextPage() {
        this._page++;

        return this.fetchEpics();
    }

    listRelatedUserStories(epic) {
        return this.resources.userstories.listInEpic(epic.get("id"));
    }

    createEpic(epicData, attachments) {
        epicData.project = this.projectService.project.get("id");

        return this.resources.epics.post(epicData)
            .then((epic) => {
                const promises = _.map(attachments.toJS(), (attachment: any) => {
                    return this.attachmentsService.upload(attachment.file, epic.get("id"), epic.get("project"), "epic");
                });

                return Promise.all(promises).then(this.fetchEpics.bind(this, true));
        });
    }

    reorderEpic(epic, newIndex) {
        const orderList = {};
        this._epics.forEach((it) => orderList[it.get("id")] = it.get("epics_order"));

        const withoutMoved = this.epics.filter((it) => it.get("id") !== epic.get("id"));
        const beforeDestination = withoutMoved.slice(0, newIndex);
        const afterDestination = withoutMoved.slice(newIndex);

        const previous = beforeDestination.last();
        const newOrder = !previous ? 0 : previous.get("epics_order") + 1;

        orderList[epic.get("id")] = newOrder;

        const previousWithTheSameOrder = beforeDestination.filter((it) => {
            return it.get("epics_order") === previous.get("epics_order");
        });

        const setOrders = _.fromPairs(previousWithTheSameOrder.map((it) => {
            return [it.get("id"), it.get("epics_order")];
        }).toJS(),
        );

        afterDestination.forEach((it) => orderList[it.get("id")] = it.get("epics_order") + 1);

        this._epics = this._epics.map((it) => it.set("epics_order", orderList[it.get("id")]));
        this._epics = this._epics.sortBy((it) => it.get("epics_order"));

        const data = {
            epics_order: newOrder,
            version: epic.get("version"),
        };

        return this.resources.epics.reorder(epic.get("id"), data, setOrders).then((newEpic) => {
            return this._epics = this._epics.map(function(it) {
                if (it.get("id") === newEpic.get("id")) {
                    return newEpic;
                }

                return it;
            });
        });
    }

    reorderRelatedUserstory(epic, epicUserstories, userstory, newIndex) {
        const withoutMoved = epicUserstories.filter((it) => it.get("id") !== userstory.get("id"));
        const beforeDestination = withoutMoved.slice(0, newIndex);

        const previous = beforeDestination.last();
        const newOrder = !previous ? 0 : previous.get("epic_order") + 1;

        const previousWithTheSameOrder = beforeDestination.filter((it) => {
            return it.get("epic_order") === previous.get("epic_order");
        });
        const setOrders = _.fromPairs(previousWithTheSameOrder.map((it) => {
            return [it.get("id"), it.get("epic_order")];
        }).toJS(),
        );

        const data = {
            order: newOrder,
        };
        const epicId = epic.get("id");
        const userstoryId = userstory.get("id");
        return this.resources.epics.reorderRelatedUserstory(epicId, userstoryId, data, setOrders)
            .then(() => {
                return this.listRelatedUserStories(epic);
        });
    }

    replaceEpic(epic) {
        return this._epics = this._epics.map(function(it) {
            if (it.get("id") === epic.get("id")) {
                return epic;
            }

            return it;
        });
    }

    updateEpicStatus(epic, statusId) {
        const data = {
            status: statusId,
            version: epic.get("version"),
        };

        return this.resources.epics.patch(epic.get("id"), data)
            .then(this.replaceEpic.bind(this));
    }

    updateEpicAssignedTo(epic, userId) {
        const data = {
            assigned_to: userId,
            version: epic.get("version"),
        };

        return this.resources.epics.patch(epic.get("id"), data)
            .then(this.replaceEpic.bind(this));
    }
}
EpicsService.initClass();
