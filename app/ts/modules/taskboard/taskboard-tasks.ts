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
 * File: home.service.coffee
 */

import {groupBy} from "../../utils"
import {Service} from "../../classes"
import * as Immutable from "immutable"
import * as _ from "lodash"
import * as angular from "angular"

class TaskboardTasksService extends Service {
    tasksRaw:any
    foldStatusChanged:any
    usTasks:any
    project:any
    usersById:any
    userstories:any
    order:any

    static initClass() {
        this.$inject = [];
    }
    constructor() {
        super()
        this.reset();
    }

    reset() {
        this.tasksRaw = [];
        this.foldStatusChanged = {};
        return this.usTasks = Immutable.Map();
    }

    init(project, usersById) {
        this.project = project;
        return this.usersById = usersById;
    }

    resetFolds() {
        this.foldStatusChanged = {};
        return this.refresh();
    }

    toggleFold(taskId) {
        this.foldStatusChanged[taskId] = !this.foldStatusChanged[taskId];
        return this.refresh();
    }

    add(task) {
        this.tasksRaw = this.tasksRaw.concat(task);
        return this.refresh();
    }

    set(tasks) {
        this.tasksRaw = tasks;
        this.refreshRawOrder();
        return this.refresh();
    }

    setUserstories(userstories) {
        return this.userstories = userstories;
    }

    refreshRawOrder() {
        this.order = {};

        return Array.from(this.tasksRaw).map((task) => (this.order[task.id] = task.taskboard_order));
    }

    assignOrders(order) {
        order = _.invert(order);
        this.order = _.assign(this.order, order);

        return this.refresh();
    }

    getTask(id) {
        let findedTask = null;

        this.usTasks.forEach(function(us) {
            us.forEach(function(status) {
                findedTask = status.find(task => task.get('id') === id);

                if (findedTask) { return false; }
            });

            if (findedTask) { return false; }
        });

        return findedTask;
    }

    replace(task) {
        return this.usTasks = this.usTasks.map(us =>
            us.map(function(status) {
                let findedIndex = status.findIndex(usItem => usItem.get('id') === us.get('id'));

                if (findedIndex !== -1) {
                    status = status.set(findedIndex, task);
                }

                return status;
            })
        );
    }

    getTaskModel(id) {
        return _.find(this.tasksRaw, (task:any) => task.id === id);
    }

    replaceModel(task) {
        this.tasksRaw = _.map(this.tasksRaw, function(it:any) {
            if (task.id === it.id) {
                return task;
            } else {
                return it;
            }
        });

        return this.refresh();
    }

    move(id, usId, statusId, index) {
        let it;
        let task = this.getTaskModel(id);

        let taskByUsStatus = _.filter(this.tasksRaw, (task:any) => {
            return (task.status === statusId) && (task.user_story === usId);
        });

        taskByUsStatus = _.sortBy(taskByUsStatus, (it:any) => this.order[it.id]);

        let taksWithoutMoved = _.filter(taskByUsStatus, (it:any) => it.id !== id);
        let beforeDestination = _.slice(taksWithoutMoved, 0, index);
        let afterDestination = _.slice(taksWithoutMoved, index);

        let setOrders = {};

        let previous = beforeDestination[beforeDestination.length - 1];

        let previousWithTheSameOrder = _.filter(beforeDestination, (it:any) => {
            return this.order[it.id] === this.order[previous.id];
    });

        if (previousWithTheSameOrder.length > 1) {
            for (it of Array.from(previousWithTheSameOrder)) {
                setOrders[it.id] = this.order[it.id];
            }
        }

        if (!previous) {
            this.order[task.id] = 0;
        } else if (previous) {
            this.order[task.id] = this.order[previous.id] + 1;
        }

        for (let key = 0; key < afterDestination.length; key++) {
            it = afterDestination[key];
            this.order[it.id] = this.order[task.id] + key + 1;
        }

        task.status = statusId;
        task.user_story = usId;
        task.taskboard_order = this.order[task.id];

        this.refresh();

        return {"task_id": task.id, "order": this.order[task.id], "set_orders": setOrders};
    }

    refresh() {
        let status;
        this.tasksRaw = _.sortBy(this.tasksRaw, (it:any) => this.order[it.id]);

        let tasks = this.tasksRaw;
        let taskStatusList = _.sortBy(this.project.task_statuses, "order");

        let usTasks = {};

        // Iterate over all userstories and
        // null userstory for unassigned tasks
        for (let us of Array.from(_.union(this.userstories, [{id:null}]))) {
            usTasks[us.id] = {};
            for (status of Array.from(taskStatusList)) {
                usTasks[us.id][status.id] = [];
            }
        }

        for (let taskModel of Array.from(tasks)) {
            if ((usTasks[taskModel.user_story] != null) && (usTasks[taskModel.user_story][taskModel.status] != null)) {
                let task:any = {};

                let model = taskModel.getAttrs();

                task.foldStatusChanged = this.foldStatusChanged[taskModel.id];
                task.model = model;
                task.images = _.filter(model.attachments, (it:any) => !!it.thumbnail_card_url);
                task.id = taskModel.id;
                task.assigned_to = this.usersById[taskModel.assigned_to];
                task.colorized_tags = _.map(task.model.tags, tag => {
                    return {name: tag[0], color: tag[1]};
            });

                usTasks[taskModel.user_story][taskModel.status].push(task);
            }
        }

        return this.usTasks = Immutable.fromJS(usTasks);
    }
}
TaskboardTasksService.initClass();

angular.module("taigaKanban").service("tgTaskboardTasks", TaskboardTasksService);
