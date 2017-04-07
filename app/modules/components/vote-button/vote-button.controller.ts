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
 * File: vote-button.controller.coffee
 */

class VoteButtonController {
    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
        ];
    }

    constructor(currentUserService) {
        this.currentUserService = currentUserService;
        this.user = this.currentUserService.getUser();
        this.isMouseOver = false;
        this.loading = false;
    }

    showTextWhenMouseIsOver() {
        return this.isMouseOver = true;
    }

    showTextWhenMouseIsLeave() {
        return this.isMouseOver = false;
    }

    toggleVote() {
        let promise;
        this.loading = true;

        if (!this.item.is_voter) {
            promise = this._upvote();
        } else {
            promise = this._downvote();
        }

        promise.finally(() => this.loading = false);

        return promise;
    }

    _upvote() {
        return this.onUpvote().then(() => {
            return this.showTextWhenMouseIsLeave();
        });
    }

    _downvote() {
        return this.onDownvote();
    }
}
VoteButtonController.initClass();

angular.module("taigaComponents").controller("VoteButton", VoteButtonController);
