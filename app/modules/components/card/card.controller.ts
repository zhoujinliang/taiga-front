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
 * File: card.controller.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

class CardController {
    zoom:any
    item:any
    onToggleFold:any
    type:any

    static initClass() {
        this.$inject = [];
    }

    visible(name) {
        return this.zoom.indexOf(name) !== -1;
    }

    hasTasks() {
        let tasks = this.item.getIn(['model', 'tasks']);
        return tasks && (tasks.size > 0);
    }

    hasVisibleAttachments() {
        return this.item.get('images').size > 0;
    }

    toggleFold() {
        return this.onToggleFold({id: this.item.get('id')});
    }

    getClosedTasks() {
        return this.item.getIn(['model', 'tasks']).filter(task => task.get('is_closed'));
    }

    closedTasksPercent() {
        return (this.getClosedTasks().size * 100) / this.item.getIn(['model', 'tasks']).size;
    }

    getPermissionsKey() {
        if (this.type === 'task') {
            return 'modify_task';
        } else {
            return 'modify_us';
        }
    }

    _setVisibility() {
        let visibility = {
            related: this.visible('related_tasks'),
            slides: this.visible('attachments')
        };

        if(!_.isUndefined(this.item.get('foldStatusChanged'))) {
            if (this.visible('related_tasks') && this.visible('attachments')) {
                visibility.related = !this.item.get('foldStatusChanged');
                visibility.slides = !this.item.get('foldStatusChanged');
            } else if (this.visible('attachments')) {
                visibility.related = this.item.get('foldStatusChanged');
                visibility.slides = this.item.get('foldStatusChanged');
            } else if (!this.visible('related_tasks') && !this.visible('attachments')) {
                visibility.related = this.item.get('foldStatusChanged');
                visibility.slides = this.item.get('foldStatusChanged');
            }
        }

        if (!this.item.getIn(['model', 'tasks']) || !this.item.getIn(['model', 'tasks']).size) {
            visibility.related = false;
        }

        if (!this.item.get('images') || !this.item.get('images').size) {
            visibility.slides = false;
        }

        return visibility;
    }

    isRelatedTasksVisible() {
        let visibility = this._setVisibility();

        return visibility.related;
    }

    isSlideshowVisible() {
        let visibility = this._setVisibility();

        return visibility.slides;
    }

    getNavKey() {
        if (this.type === 'task') {
            return 'project-tasks-detail';
        } else {
            return 'project-userstories-detail';
        }
    }
}
CardController.initClass();

angular.module('taigaComponents').controller('Card', CardController);
