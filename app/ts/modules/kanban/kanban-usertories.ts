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
 * File: kanban-userstories.service.coffee
 */

import {Service} from "../../../ts/classes"
import * as _ from "lodash"
import * as angular from "angular"
import * as Immutable from "immutable"

class KanbanUserstoriesService extends Service {
    userstoriesRaw:any
    archivedStatus:any
    statusHide:any
    foldStatusChanged:any
    usByStatus:any
    project:any
    usersById:any
    archived:any
    order:any

    static initClass() {
        this.$inject = [];
    }

    constructor() {
        super()
        this.reset();
    }

    reset() {
        this.userstoriesRaw = [];
        this.archivedStatus = [];
        this.statusHide = [];
        this.foldStatusChanged = {};
        return this.usByStatus = Immutable.Map();
    }

    init(project, usersById) {
        this.project = project;
        return this.usersById = usersById;
    }

    resetFolds() {
        this.foldStatusChanged = {};
        return this.refresh();
    }

    toggleFold(usId) {
        this.foldStatusChanged[usId] = !this.foldStatusChanged[usId];
        return this.refresh();
    }

    set(userstories) {
        this.userstoriesRaw = userstories;
        this.refreshRawOrder();
        return this.refresh();
    }

    add(us) {
        this.userstoriesRaw = this.userstoriesRaw.concat(us);
        this.refreshRawOrder();
        return this.refresh();
    }

    addArchivedStatus(statusId) {
        return this.archivedStatus.push(statusId);
    }

    isUsInArchivedHiddenStatus(usId) {
        let us = this.getUsModel(usId);

        return (this.archivedStatus.indexOf(us.status) !== -1) &&
            (this.statusHide.indexOf(us.status) !== -1);
    }

    hideStatus(statusId) {
        this.deleteStatus(statusId);
        return this.statusHide.push(statusId);
    }

    showStatus(statusId) {
        return _.remove(this.statusHide, it => it === statusId);
    }

    getStatus(statusId) {
        return _.filter(this.userstoriesRaw, us => us.status === statusId);
    }

    deleteStatus(statusId) {
        let toDelete = _.filter(this.userstoriesRaw, us => us.status === statusId);
        toDelete = _.map(it => it.id);

        this.archived = _.difference(this.archived, toDelete);

        this.userstoriesRaw = _.filter(this.userstoriesRaw, us => us.status !== statusId);

        return this.refresh();
    }

    refreshRawOrder() {
        this.order = {};

        return Array.from(this.userstoriesRaw).map((it) => (this.order[it.id] = it.kanban_order));
    }

    assignOrders(order) {
        order = _.invert(order);
        this.order = _.assign(this.order, order);

        return this.refresh();
    }

    move(id, statusId, index) {
        let it;
        let us = this.getUsModel(id);

        let usByStatus = _.filter(this.userstoriesRaw, it => {
            return it.status === statusId;
        });

        usByStatus = _.sortBy(usByStatus, it => this.order[it.id]);

        let usByStatusWithoutMoved = _.filter(usByStatus, it => it.id !== id);
        let beforeDestination = _.slice(usByStatusWithoutMoved, 0, index);
        let afterDestination = _.slice(usByStatusWithoutMoved, index);

        let setOrders = {};

        let previous = beforeDestination[beforeDestination.length - 1];

        let previousWithTheSameOrder = _.filter(beforeDestination, it => {
            return this.order[it.id] === this.order[previous.id];
    });

        if (previousWithTheSameOrder.length > 1) {
            for (it of Array.from(previousWithTheSameOrder)) {
                setOrders[it.id] = this.order[it.id];
            }
        }

        if (!previous) {
            this.order[us.id] = 0;
        } else if (previous) {
            this.order[us.id] = this.order[previous.id] + 1;
        }

        for (let key = 0; key < afterDestination.length; key++) {
            it = afterDestination[key];
            this.order[it.id] = this.order[us.id] + key + 1;
        }

        us.status = statusId;
        us.kanban_order = this.order[us.id];

        this.refresh();

        return {"us_id": us.id, "order": this.order[us.id], "set_orders": setOrders};
    }

    replace(us) {
        return this.usByStatus = this.usByStatus.map(function(status) {
            let findedIndex = status.findIndex(usItem => usItem.get('id') === us.get('id'));

            if (findedIndex !== -1) {
                status = status.set(findedIndex, us);
            }

            return status;
        });
    }

    replaceModel(us) {
        this.userstoriesRaw = _.map(this.userstoriesRaw, function(usItem) {
            if (us.id === usItem.id) {
                return us;
            } else {
                return usItem;
            }
        });

        return this.refresh();
    }

    getUs(id) {
        let findedUs = null;

        this.usByStatus.forEach(function(status) {
            findedUs = status.find(us => us.get('id') === id);

            if (findedUs) { return false; }
        });

        return findedUs;
    }

    getUsModel(id) {
        return _.find(this.userstoriesRaw, us => us.id === id);
    }

    refresh() {
        let model;
        this.userstoriesRaw = _.sortBy(this.userstoriesRaw, it => this.order[it.id]);

        let userstories = this.userstoriesRaw;
        userstories = _.map(userstories, usModel => {
            let us = {};

            model = usModel.getAttrs();

            us.foldStatusChanged = this.foldStatusChanged[usModel.id];

            us.model = model;
            us.images = _.filter(model.attachments, it => !!it.thumbnail_card_url);

            us.id = usModel.id;
            us.assigned_to = this.usersById[usModel.assigned_to];
            us.colorized_tags = _.map(us.model.tags, tag => {
                return {name: tag[0], color: tag[1]};
        });

            return us;
        });

        let usByStatus = _.groupBy(userstories, us => us.model.status);

        return this.usByStatus = Immutable.fromJS(usByStatus);
    }
}
KanbanUserstoriesService.initClass();

angular.module("taigaKanban").service("tgKanbanUserstories", KanbanUserstoriesService);
