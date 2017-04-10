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
 * File: profile.module.coffee
 */

import * as angular from "angular"

import {ProfileBarController} from "./profile-bar/profile-bar.controller"
import {ProfileBarDirective} from "./profile-bar/profile-bar.directive"
import {ProfileContactsController} from "./profile-contacts/profile-contacts.controller"
import {ProfileContactsDirective } from "./profile-contacts/profile-contacts.directive"
import {ProfileController} from "./profile.controller"
import {FavItemDirective} from "./profile-favs/items/items.directive"
import {ProfileLikedController, ProfileVotedController, ProfileWatchedController} from "./profile-favs/profile-favs.controller"
import {ProfileVotedDirective, ProfileLikedDirective, ProfileWatchedDirective} from "./profile-favs/profile-favs.directive"
import {ProfileHintsController} from "./profile-hints/profile-hints.controller"
import {ProfileHintsDirective} from "./profile-hints/profile-hints.directive"
import {ProfileProjectsController} from "./profile-projects/profile-projects.controller"
import {ProfileProjectsDirective } from "./profile-projects/profile-projects.directive"
import {ProfileTabDirective} from "./profile-tab/profile-tab.directive"
import {ProfileTabsController} from "./profile-tabs/profile-tabs.controller"
import {ProfileTabsDirective} from "./profile-tabs/profile-tabs.directive"

let module = angular.module("taigaProfile", []);
module.controller("ProfileBar", ProfileBarController);
module.directive("tgProfileBar", ProfileBarDirective);
module.controller("ProfileContacts", ProfileContactsController);
module.directive("tgProfileContacts", ProfileContactsDirective);
module.controller("Profile", ProfileController);
module.directive("tgFavItem", FavItemDirective);
module.controller("ProfileLiked", ProfileLikedController);
module.controller("ProfileVoted", ProfileVotedController);
module.controller("ProfileWatched", ProfileWatchedController);
module.directive("tgProfileVoted", ProfileVotedDirective);
module.directive("tgProfileLiked", ProfileLikedDirective);
module.directive("tgProfileWatched", ProfileWatchedDirective);
module.controller("ProfileHints", ProfileHintsController);
module.directive("tgProfileHints", ProfileHintsDirective);
module.controller("ProfileProjects", ProfileProjectsController);
module.directive("tgProfileProjects", ProfileProjectsDirective);
module.directive("tgProfileTab", ProfileTabDirective);
module.controller("ProfileTabs", ProfileTabsController);
module.directive("tgProfileTabs", ProfileTabsDirective);
