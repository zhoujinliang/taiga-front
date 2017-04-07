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
 * File: profile-favs.controller.coffee
 */

let { debounceLeading } = this.taiga;

class FavsBaseController {
    static initClass() {
    
        //###############################################
        //# Filtre actions
        //###############################################
        this.prototype.filterByTextQuery = debounceLeading(500, function() {
            this._resetList();
            return this.loadItems();
        });
    }
    constructor() {
        this._init();
    }

        //@._getItems = null # Define in inheritance classes
        //
    _init() {
        this.enableFilterByAll = true;
        this.enableFilterByProjects = true;
        this.enableFilterByEpics = true;
        this.enableFilterByUserStories = true;
        this.enableFilterByTasks = true;
        this.enableFilterByIssues = true;
        this.enableFilterByTextQuery = true;

        this._resetList();
        this.q = null;
        return this.type = null;
    }

    _resetList() {
        this.items = Immutable.List();
        this.scrollDisabled = false;
        return this._page = 1;
    }

    _enableLoadingSpinner() {
        return this.isLoading = true;
    }

    _disableLoadingSpinner() {
        return this.isLoading = false;
    }

    _enableScroll() {
        return this.scrollDisabled = false;
    }

    _disableScroll() {
        return this.scrollDisabled = true;
    }

    _checkIfHasMorePages(hasNext) {
        if (hasNext) {
            this._page += 1;
            return this._enableScroll();
        } else {
            return this._disableScroll();
        }
    }

    _checkIfHasNoResults() {
        return this.hasNoResults = this.items.size === 0;
    }

    loadItems() {
        this._enableLoadingSpinner();
        this._disableScroll();

        return this._getItems(this.user.get("id"), this._page, this.type, this.q)
            .then(response => {
                this.items = this.items.concat(response.get("data"));

                this._checkIfHasMorePages(response.get("next"));
                this._checkIfHasNoResults();
                this._disableLoadingSpinner();

                return this.items;
        }).catch(() => {
                this._disableLoadingSpinner();

                return this.items;
        });
    }

    showAll() {
        if (this.type !== null) {
            this.type = null;
            this._resetList();
            return this.loadItems();
        }
    }

    showProjectsOnly() {
        if (this.type !== "project") {
            this.type = "project";
            this._resetList();
            return this.loadItems();
        }
    }

    showEpicsOnly() {
        if (this.type !== "epic") {
            this.type = "epic";
            this._resetList();
            return this.loadItems();
        }
    }

    showUserStoriesOnly() {
        if (this.type !== "userstory") {
            this.type = "userstory";
            this._resetList();
            return this.loadItems();
        }
    }

    showTasksOnly() {
        if (this.type !== "task") {
            this.type = "task";
            this._resetList();
            return this.loadItems();
        }
    }

    showIssuesOnly() {
        if (this.type !== "issue") {
            this.type = "issue";
            this._resetList();
            return this.loadItems();
        }
    }
}
FavsBaseController.initClass();


//###################################################
//# Liked
//###################################################

class ProfileLikedController extends FavsBaseController {
    static initClass() {
        this.$inject = [
            "tgUserService",
        ];
    }

    constructor(userService) {
        this.userService = userService;
        super();
        this.tabName = 'likes';
        this.enableFilterByAll = false;
        this.enableFilterByProjects = false;
        this.enableFilterByEpics = false;
        this.enableFilterByUserStories = false;
        this.enableFilterByTasks = false;
        this.enableFilterByIssues = false;
        this.enableFilterByTextQuery = true;
        this._getItems = this.userService.getLiked;
    }
}
ProfileLikedController.initClass();


angular.module("taigaProfile")
    .controller("ProfileLiked", ProfileLikedController);

//###################################################
//# Voted
//###################################################

class ProfileVotedController extends FavsBaseController {
    static initClass() {
        this.$inject = [
            "tgUserService",
        ];
    }

    constructor(userService) {
        this.userService = userService;
        super();
        this.tabName = 'upvotes';
        this.enableFilterByAll = true;
        this.enableFilterByProjects = false;
        this.enableFilterByEpics = true;
        this.enableFilterByUserStories = true;
        this.enableFilterByTasks = true;
        this.enableFilterByIssues = true;
        this.enableFilterByTextQuery = true;
        this._getItems = this.userService.getVoted;
    }
}
ProfileVotedController.initClass();


angular.module("taigaProfile")
    .controller("ProfileVoted", ProfileVotedController);



//###################################################
//# Watched
//###################################################

class ProfileWatchedController extends FavsBaseController {
    static initClass() {
        this.$inject = [
            "tgUserService",
        ];
    }

    constructor(userService) {
        this.userService = userService;
        super();
        this.tabName = 'watchers';
        this._getItems = this.userService.getWatched;
    }
}
ProfileWatchedController.initClass();


angular.module("taigaProfile")
    .controller("ProfileWatched", ProfileWatchedController);
