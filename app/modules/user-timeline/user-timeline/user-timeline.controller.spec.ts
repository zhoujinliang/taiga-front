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
 * File: user-timeline.controller.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
declare var sinon:any;

describe("UserTimelineController", function() {
    let $q, $rootScope, provide, scope;
    let controller = (scope = ($q = (provide = ($rootScope = null))));

    let mocks:any = {};

    let mockUser = Immutable.fromJS({id: 3});

    let _mockUserTimeline = function() {
        mocks.userTimelineService = {
            getProfileTimeline: sinon.stub(),
            getProjectTimeline: sinon.stub()
        };

        return provide.value("tgUserTimelineService", mocks.userTimelineService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserTimeline();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaUserTimeline");
        _mocks();

        return inject(function($controller, _$q_, _$rootScope_) {
            $q = _$q_;
            controller = $controller;
            return $rootScope = _$rootScope_;
        });
    });

    it("timelineList should be an array", function() {
        let $scope = $rootScope.$new();

        mocks.userTimelineService.getUserTimeline = sinon.stub().returns(true);

        let myCtrl = controller("UserTimeline", $scope, {
            user: Immutable.Map({id: 2})
        });

        return expect(myCtrl.timelineList.toJS()).is.an("array");
    });

    describe("init timeline", function() {
        it("project timeline sequence", function() {
            mocks.userTimelineService.getProjectTimeline = sinon.stub().withArgs(4).returns(true);

            let $scope = $rootScope.$new();

            let myCtrl = controller("UserTimeline", $scope, {
                projectId: 4
            });

            return expect(myCtrl.timeline).to.be.true;
        });

        it("currentUser timeline sequence", function() {
            mocks.userTimelineService.getProfileTimeline = sinon.stub().withArgs(2).returns(true);

            let $scope = $rootScope.$new();

            let myCtrl = controller("UserTimeline", $scope, {
                currentUser: true,
                user: Immutable.Map({id: 2})
            });

            return expect(myCtrl.timeline).to.be.true;
        });

        return it("currentUser timeline sequence", function() {
            mocks.userTimelineService.getUserTimeline = sinon.stub().withArgs(2).returns(true);

            let $scope = $rootScope.$new();

            let myCtrl = controller("UserTimeline", $scope, {
                user: Immutable.Map({id: 2})
            });

            return expect(myCtrl.timeline).to.be.true;
        });
    });

    return describe("load timeline", function() {
        let myCtrl = null;

        beforeEach(function() {
            mocks.userTimelineService.getUserTimeline = sinon.stub().returns({});
            let $scope = $rootScope.$new();
            return myCtrl = controller("UserTimeline", $scope, {
                user: Immutable.Map({id: 2})
            });
        });

        it("enable scroll on loadTimeline if there are more pages", function(done) {
            let response = Immutable.Map({
                items: [1, 2, 3],
                next: true
            });

            myCtrl.timeline.next = (<any>sinon.stub()).promise();
            myCtrl.timeline.next.resolve(response);

            expect(myCtrl.scrollDisabled).to.be.false;

            return myCtrl.loadTimeline().then(function() {
                expect(myCtrl.scrollDisabled).to.be.false;

                return done();
            });
        });

        it("disable scroll on loadTimeline if there are more pages", function(done) {
            let response = Immutable.Map({
                items: [1, 2, 3],
                next: false
            });

            myCtrl.timeline.next = (<any>sinon.stub()).promise();
            myCtrl.timeline.next.resolve(response);

            expect(myCtrl.scrollDisabled).to.be.false;

            return myCtrl.loadTimeline().then(function() {
                expect(myCtrl.scrollDisabled).to.be.true;

                return done();
            });
        });

        return it("concat response data", function(done) {
            let response = Immutable.Map({
                items: [1, 2, 3],
                next: false
            });

            myCtrl.timelineList = Immutable.List([1, 2]);
            myCtrl.timeline.next = (<any>sinon.stub()).promise();
            myCtrl.timeline.next.resolve(response);

            expect(myCtrl.scrollDisabled).to.be.false;

            return myCtrl.loadTimeline().then(function() {
                expect(myCtrl.timelineList.size).to.be.equal(5);

                return done();
            });
        });
    });
});
