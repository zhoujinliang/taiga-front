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
 * File: user-timeline.service.coffee
 */

let { taiga } = this;

class UserTimelineService extends taiga.Service {
    static initClass() {
        this.$inject = [
            "tgResources",
            "tgUserTimelinePaginationSequenceService",
            "tgUserTimelineItemType",
            "tgUserTimelineItemTitle"
        ];
    
        this.prototype._valid_fields = [
            'status',
            'subject',
            'description_diff',
            'assigned_to',
            'points',
            'severity',
            'priority',
            'type',
            'attachments',
            'is_iocaine',
            'content_diff',
            'name',
            'estimated_finish',
            'estimated_start',
            // customs
            'blocked',
            'moveInBacklog',
            'milestone',
            'color'
        ];
    
        this.prototype._invalid = [
            {// Items with only invalid fields
                check(timeline) {
                    let value_diff = timeline.get("data").get("value_diff");
    
                    if (value_diff) {
                        let fieldKey = value_diff.get('key');
    
                        if (this._valid_fields.indexOf(fieldKey) === -1) {
                            return true;
                        } else if ((fieldKey === 'attachments') &&
                             (value_diff.get('value').get('new').size === 0)) {
                            return true;
                        }
                    }
    
                    return false;
                }
            },
            {// Empty change
                check(timeline) {
                    let event = timeline.get('event_type').split(".");
                    let value_diff = timeline.get("data").get("value_diff");
                    return (event[2] === 'change') && (value_diff === undefined);
                }
            },
            {// Deleted
                check(timeline) {
                    let event = timeline.get('event_type').split(".");
                    return event[2] === 'delete';
                }
            },
            {// Project change
                check(timeline) {
                    let event = timeline.get('event_type').split(".");
                    return (event[1] === 'project') && (event[2] === 'change');
                }
            },
            {// Comment deleted
                check(timeline) {
                    return !!timeline.get("data").get("comment_deleted");
                }
            },
            {// Task milestone
                check(timeline) {
                    let event = timeline.get('event_type').split(".");
                    let value_diff = timeline.get("data").get("value_diff");
    
                    if (value_diff &&
                         (event[1] === "task") &&
                         (event[2] === "change") &&
                         (value_diff.get("key") === "milestone")) {
                        return timeline.get("data").get("value_diff").get("value");
                    }
    
                    return false;
                }
            }
        ];
    }

    constructor(rs, userTimelinePaginationSequenceService, userTimelineItemType, userTimelineItemTitle) {
        this.rs = rs;
        this.userTimelinePaginationSequenceService = userTimelinePaginationSequenceService;
        this.userTimelineItemType = userTimelineItemType;
        this.userTimelineItemTitle = userTimelineItemTitle;
    }

    _isInValidTimeline(timeline) {
        return _.some(this._invalid, invalid => {
            return invalid.check.call(this, timeline);
        });
    }

    _parseEventType(event_type) {
        event_type = event_type.split(".");

        return {
            section: event_type[0],
            obj: event_type[1],
            type: event_type[2]
        };
    }

    _getTimelineObject(timeline, event) {
        if (timeline.get('data').get(event.obj)) {
            return timeline.get('data').get(event.obj);
        }
    }

    _attachExtraInfoToTimelineEntry(timeline, event, type) {
        let title = this.userTimelineItemTitle.getTitle(timeline, event, type);

        timeline = timeline.set('title_html', title);

        timeline =  timeline.set('obj', this._getTimelineObject(timeline, event));

        if (type.description) {
            timeline = timeline.set('description', type.description(timeline));
        }

        if (type.member) {
            timeline = timeline.set('member', type.member(timeline));
        }

        if ((timeline.getIn(['data', 'value_diff', 'key']) === 'attachments') &&
          timeline.hasIn(['data', 'value_diff', 'value', 'new'])) {
            timeline = timeline.set('attachments', timeline.getIn(['data', 'value_diff', 'value', 'new']));
        }

        return timeline;
    }

    // - create a entry per every item in the values_diff
    _parseTimeline(response) {
        let newdata = Immutable.List();

        response.get('data').forEach(item => {
            let newItem;
            let event = this._parseEventType(item.get('event_type'));

            let data = item.get('data');
            let values_diff = data.get('values_diff');

            if (values_diff && values_diff.count()) {
                // blocked/unblocked change must be a single change
                if (values_diff.has('is_blocked')) {
                    values_diff = Immutable.Map({'blocked': values_diff});
                }

                if (values_diff.has('milestone')) {
                    if (event.obj === 'userstory') {
                        values_diff = Immutable.Map({'moveInBacklog': values_diff});
                    } else {
                        values_diff = values_diff.deleteIn(['values_diff', 'milestone']);
                    }

                } else if (event.obj === 'milestone') {
                     values_diff = Immutable.Map({'milestone': values_diff});
                 }

                return values_diff.forEach((value, key) => {
                    let obj = Immutable.Map({
                        key,
                        value
                    });

                    newItem = item.setIn(['data', 'value_diff'], obj);
                    newItem = newItem.deleteIn(['data', 'values_diff']);
                    return newdata = newdata.push(newItem);
                });
            } else {
                newItem = item.deleteIn(['data', 'values_diff']);
                return newdata = newdata.push(newItem);
            }
        });

        return response.set('data', newdata);
    }

    _addEntyAttributes(item) {
        let event = this._parseEventType(item.get('event_type'));
        let type = this.userTimelineItemType.getType(item, event);

        return this._attachExtraInfoToTimelineEntry(item, event, type);
    }

    getProfileTimeline(userId) {
        let config = {};

        config.fetch = page => {
            return this.rs.users.getProfileTimeline(userId, page)
                .then(response => {
                    return this._parseTimeline(response);
            });
        };

        config.map = obj => this._addEntyAttributes(obj);

        config.filter = items => {
            return items.filterNot(item => this._isInValidTimeline(item));
        };

        return this.userTimelinePaginationSequenceService.generate(config);
    }

    getUserTimeline(userId) {
        let config = {};

        config.fetch = page => {
            return this.rs.users.getUserTimeline(userId, page)
                .then(response => {
                    return this._parseTimeline(response);
            });
        };

        config.map = obj => this._addEntyAttributes(obj);

        config.filter = items => {
            return items.filterNot(item => this._isInValidTimeline(item));
        };

        return this.userTimelinePaginationSequenceService.generate(config);
    }

    getProjectTimeline(projectId) {
        let config = {};

        config.fetch = page => {
            return this.rs.projects.getTimeline(projectId, page)
                .then(response => { return this._parseTimeline(response); });
        };

        config.map = obj => this._addEntyAttributes(obj);

        config.filter = items => {
            return items.filterNot(item => this._isInValidTimeline(item));
        };

        return this.userTimelinePaginationSequenceService.generate(config);
    }
}
UserTimelineService.initClass();

angular.module("taigaUserTimeline").service("tgUserTimelineService", UserTimelineService);
