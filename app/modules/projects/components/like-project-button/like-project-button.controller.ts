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
 * File: like-project-button.controller.coffee
 */

import * as angular from "angular"

class LikeProjectButtonController {
    confirm:any
    likeButtonService:any
    isMouseOver:boolean
    loading:boolean
    project:any

    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "tgLikeProjectButtonService"
        ];
    }

    constructor(confirm, likeButtonService){
        this.confirm = confirm;
        this.likeButtonService = likeButtonService;
        this.isMouseOver = false;
        this.loading = false;
    }

    showTextWhenMouseIsOver() {
        return this.isMouseOver = true;
    }

    showTextWhenMouseIsLeave() {
        return this.isMouseOver = false;
    }

    toggleLike() {
        let promise;
        this.loading = true;

        if (!this.project.get("is_fan")) {
            promise = this._like();
        } else {
            promise = this._unlike();
        }

        promise.finally(() => this.loading = false);

        return promise;
    }

    _like() {
        return this.likeButtonService.like(this.project.get('id'))
            .then(() => {
                return this.showTextWhenMouseIsLeave();
        }).catch(() => {
                return this.confirm.notify("error");
        });
    }

    _unlike() {
        return this.likeButtonService.unlike(this.project.get('id')).catch(() => {
            return this.confirm.notify("error");
        });
    }
}
LikeProjectButtonController.initClass();

angular.module("taigaProjects").controller("LikeProjectButton", LikeProjectButtonController);
