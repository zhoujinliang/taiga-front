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
 * File: user-timeline.module.coffee
 */

import * as angular from "angular"

import {UserTimelineAttachmentDirective} from "./user-timeline-attachment/user-timeline-attachment.directive"
import {UserTimelineItemDirective} from "./user-timeline-item/user-timeline-item.directive"
import {UserTimelineItemTitle} from "./user-timeline-item/user-timeline-item-title.service"
import {UserTimelineType} from "./user-timeline-item/user-timeline-item-type.service"
import {UserTimelinePaginationSequence} from "./user-timeline-pagination-sequence/user-timeline-pagination-sequence.service"
import {UserTimelineController} from "./user-timeline/user-timeline.controller"
import {UserTimelineDirective} from "./user-timeline/user-timeline.directive"
import {UserTimelineService} from "./user-timeline/user-timeline.service"

let module = angular.module("taigaUserTimeline", []);
module.directive("tgUserTimelineAttachment", UserTimelineAttachmentDirective);
module.directive("tgUserTimelineItem", UserTimelineItemDirective);
module.service("tgUserTimelineItemTitle", UserTimelineItemTitle);
module.service("tgUserTimelineItemType", UserTimelineType);
module.factory("tgUserTimelinePaginationSequenceService", UserTimelinePaginationSequence);
module.controller("UserTimeline", UserTimelineController);
module.directive("tgUserTimeline", UserTimelineDirective);
module.service("tgUserTimelineService", UserTimelineService);
