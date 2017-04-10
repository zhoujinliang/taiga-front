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
 * File: user-timeline-item-title.service.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
declare var sinon:any;
import * as Immutable from "immutable"

describe("tgUserTimelineItemTitle", function() {
    let event, type;
    let mySvc = null;
    let mockTranslate = null;
    let timeline = (event = (type = null));

    let _mockTranslate = () =>
        _provide(function(provide) {
            mockTranslate = {
                instant: sinon.stub()
            };

            return provide.value("$translate", mockTranslate);
        })
    ;

    var _provide = callback =>
        module(function($provide) {
            callback($provide);
            return null;
        })
    ;

    let _mocks = () => _mockTranslate();

    let _inject = () =>
        inject(_tgUserTimelineItemTitle_ => mySvc = _tgUserTimelineItemTitle_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaUserTimeline");
        return _setup();
    });

    it("title with username", function() {
        timeline = Immutable.fromJS({
            data: {
                user: {
                    username: 'xx',
                    name: 'oo',
                    is_profile_visible: true
                }
            }
        });

        event = {};

        type = {
            key: 'TITLE_USER_NAME',
            translate_params: ['username']
        };

        mockTranslate.instant
            .withArgs('COMMON.SEE_USER_PROFILE', {username: timeline.getIn(['data', 'user', 'username'])})
            .returns('user-param');

        mockTranslate.instant
            .withArgs('TITLE_USER_NAME', {username: '{{username}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title with username not visible", function() {
        timeline = Immutable.fromJS({
            data: {
                user: {
                    username: 'xx',
                    name: 'oo',
                    is_profile_visible: false
                }
            }
        });

        event = {};

        type = {
            key: 'TITLE_USER_NAME',
            translate_params: ['username']
        };

        mockTranslate.instant
            .withArgs('COMMON.SEE_USER_PROFILE', {username: timeline.getIn(['data', 'user', 'username'])})
            .returns('user-param');

        mockTranslate.instant
            .withArgs('TITLE_USER_NAME', {username: '{{username}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title with a field name", function() {
        timeline = Immutable.fromJS({
            data: {
                value_diff: {
                    key: 'status'
                }
            }
        });

        event = {};

        type = {
            key: 'TITLE_FIELD',
            translate_params: ['field_name']
        };

        mockTranslate.instant
            .withArgs('COMMON.FIELDS.STATUS')
            .returns('field-params');

        mockTranslate.instant
            .withArgs('TITLE_FIELD', {field_name: '{{field_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title with new value", function() {
        timeline = Immutable.fromJS({
            data: {
                value_diff: {
                    key: 'status',
                    value: ['old', 'new']
                }
            }
        });

        event = {};

        type = {
            key: 'NEW_VALUE',
            translate_params: ['new_value']
        };

        mockTranslate.instant
            .withArgs('NEW_VALUE', {new_value: '{{new_value}}'})
            .returns('new_value_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("new_value_ok");
    });

    it("title with project name", function() {
        timeline = Immutable.fromJS({
            data: {
                project: {
                    name: "project_name"
                }
            }
        });

        event = {};

        type = {
            key: 'TITLE_PROJECT',
            translate_params: ['project_name']
        };

        mockTranslate.instant
            .withArgs('TITLE_PROJECT', {project_name: '{{project_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title with sprint name", function() {
        timeline = Immutable.fromJS({
            data: {
                milestone: {
                    name: "milestone_name"
                }
            }
        });

        event = {};

        type = {
            key: 'TITLE_MILESTONE',
            translate_params: ['sprint_name']
        };

        let milestoneparam = sinon.match((value => value.sprint_name === '<a tg-nav="project-taskboard:project=timeline.getIn([\'data\', \'project\', \'slug\']),sprint=timeline.getIn([\'data\', \'milestone\', \'slug\'])" title="milestone_name">milestone_name</a>'), "milestoneparam");

        mockTranslate.instant
            .withArgs('TITLE_MILESTONE', {sprint_name: '{{sprint_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title with object", function() {
        timeline = Immutable.fromJS({
            data: {
                issue: {
                    ref: '123',
                    subject: 'subject'
                }
            }
        });

        event = {
            obj: 'issue',
        };

        type = {
            key: 'TITLE_OBJ',
            translate_params: ['obj_name']
        };

        mockTranslate.instant
            .withArgs('TITLE_OBJ', {obj_name: '{{obj_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title obj wiki", function() {
        timeline = Immutable.fromJS({
            data: {
                wikipage: {
                    slug: 'slug-wiki',
                }
            }
        });

        event = {
            obj: 'wikipage',
        };

        type = {
            key: 'TITLE_OBJ',
            translate_params: ['obj_name']
        };

        mockTranslate.instant
            .withArgs('TITLE_OBJ', {obj_name: '{{obj_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    it("title obj milestone", function() {
        timeline = Immutable.fromJS({
            data: {
                milestone: {
                    name: 'milestone_name',
                }
            }
        });

        event = {
            obj: 'milestone',
        };

        type = {
            key: 'TITLE_OBJ',
            translate_params: ['obj_name']
        };

        let objparam = sinon.match((value => value.obj_name === '<a tg-nav="project-taskboard:project=timeline.getIn([\'data\', \'project\', \'slug\']),sprint=timeline.getIn([\'obj\', \'slug\'])" title="milestone_name">milestone_name</a>'), "objparam");

        mockTranslate.instant
            .withArgs('TITLE_OBJ', {obj_name: '{{obj_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });

    return it("task title with us_name", function() {
        timeline = Immutable.fromJS({
            data: {
                task: {
                    name: 'task_name',
                    userstory: {
                        ref: 2,
                        subject: 'subject'
                    }
                }
            }
        });

        event = {
            obj: 'task',
        };

        type = {
            key: 'TITLE_OBJ',
            translate_params: ['us_name']
        };

        let objparam = sinon.match((value => value.us_name === '<a tg-nav="project-userstories-detail:project=timeline.getIn([\'data\', \'project\', \'slug\']),ref=timeline.getIn([\'obj\', \'userstory\', \'ref\'])" title="#2 subject">#2 subject</a>'), "objparam");

        mockTranslate.instant
            .withArgs('TITLE_OBJ', {us_name: '{{us_name}}'})
            .returns('title_ok');

        let title = mySvc.getTitle(timeline, event, type);

        return expect(title).to.be.equal("title_ok");
    });
});
