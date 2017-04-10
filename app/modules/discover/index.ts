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
 * File: discover.module.coffee
 */

import * as angular from "angular"

import {DiscoverHomeOrderByController} from "./components/discover-home-order-by/discover-home-order-by.controller"
import {DiscoverHomeOrderByDirective} from "./components/discover-home-order-by/discover-home-order-by.directive"
import {DiscoverSearchBarController} from "./components/discover-search-bar/discover-search-bar.controller"
import {DiscoverSearchBarDirective} from "./components/discover-search-bar/discover-search-bar.directive"
import {DiscoverSearchListHeaderController} from "./components/discover-search-list-header/discover-search-list-header.controller"
import {DiscoverSearchListHeaderDirective} from "./components/discover-search-list-header/discover-search-list-header.directive"
import {FeaturedProjectsController} from "./components/featured-projects/featured-projects.controller"
import {FeaturedProjectsDirective} from "./components/featured-projects/featured-projects.directive"
import {HighlightedDirective} from "./components/highlighted/highlighted.directive"
import {MostActiveController} from "./components/most-active/most-active.controller"
import {MostActiveDirective} from "./components/most-active/most-active.directive"
import {MostLikedController} from "./components/most-liked/most-liked.controller"
import {MostLikedDirective} from "./components/most-liked/most-liked.directive"
import {DiscoverHomeController} from "./discover-home/discover-home.controller"
import {DiscoverSearchController} from "./discover-search/discover-search.controller"
import {DiscoverSearchDirective} from "./discover-search/discover-search.directive"
import {DiscoverProjectsService} from "./services/discover-projects.service"

let module = angular.module("taigaDiscover", []);
module.controller("DiscoverHomeOrderBy", DiscoverHomeOrderByController);
module.directive("tgDiscoverHomeOrderBy", DiscoverHomeOrderByDirective);
module.controller("DiscoverSearchBar", DiscoverSearchBarController);
module.directive('tgDiscoverSearchBar', DiscoverSearchBarDirective);
module.controller("DiscoverSearchListHeader", DiscoverSearchListHeaderController);
module.directive("tgDiscoverSearchListHeader", DiscoverSearchListHeaderDirective);
module.controller("FeaturedProjects", FeaturedProjectsController);
module.directive("tgFeaturedProjects", FeaturedProjectsDirective);
module.directive("tgHighlighted", HighlightedDirective);
module.controller("MostActive", MostActiveController);
module.directive("tgMostActive", MostActiveDirective);
module.controller("MostLiked", MostLikedController);
module.directive("tgMostLiked", MostLikedDirective);
module.controller("DiscoverHome", DiscoverHomeController);
module.controller("DiscoverSearch", DiscoverSearchController);
module.directive("tgDiscoverSearch", DiscoverSearchDirective);
module.service("tgDiscoverProjectsService", DiscoverProjectsService);
