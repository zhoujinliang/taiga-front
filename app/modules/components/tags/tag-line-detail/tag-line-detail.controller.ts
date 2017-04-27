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
 * File: tag-line.controller.coffee
 */

import * as angular from "angular";
import * as _ from "lodash";
import {trim} from "../../../../libs/utils";

export class TagLineController {
    rootScope: angular.IScope;
    confirm: any;
    modelTransform: any;
    loadingAddTag: any;
    loadingRemoveTag: any;
    addTag: any;

    static initClass() {
        this.$inject = [
            "$rootScope",
            "$tgConfirm",
            "$tgQueueModelTransformation",
        ];
    }

    constructor(rootScope, confirm, modelTransform) {
        this.rootScope = rootScope;
        this.confirm = confirm;
        this.modelTransform = modelTransform;
        this.loadingAddTag = false;
    }

    onDeleteTag(tag) {
        this.loadingRemoveTag = tag[0];

        const onDeleteTagSuccess = (item) => {
            this.rootScope.$broadcast("object:updated");
            this.loadingRemoveTag = false;

            return item;
        };

        const onDeleteTagError = () => {
            this.confirm.notify("error");
            return this.loadingRemoveTag = false;
        };

        const tagName = trim(tag[0].toLowerCase());

        const transform = this.modelTransform.save(function(item) {
            const itemtags = _.clone(item.tags);

            _.remove(itemtags, (tag) => tag[0] === tagName);

            item.tags = itemtags;

            return item;
        });

        return transform.then(onDeleteTagSuccess, onDeleteTagError);
    }

    onAddTag(tag, color) {
        this.loadingAddTag = true;

        const onAddTagSuccess = (item) => {
            this.rootScope.$broadcast("object:updated"); //its a kind of magic.
            this.addTag = false;
            this.loadingAddTag = false;

            return item;
        };

        const onAddTagError = () => {
            this.loadingAddTag = false;
            return this.confirm.notify("error");
        };

        const transform = this.modelTransform.save((item) => {
            const value = trim(tag.toLowerCase());

            const itemtags = _.clone(item.tags);

            itemtags.push([tag , color]);

            item.tags = itemtags;

            return item;
        });

        return transform.then(onAddTagSuccess, onAddTagError);
    }
}
TagLineController.initClass();
