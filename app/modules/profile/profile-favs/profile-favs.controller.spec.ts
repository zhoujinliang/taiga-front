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
 * You showld have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: profile-favs.controller.spec.coffee
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

describe("ProfileLiked", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let user = Immutable.fromJS({id: 2});

    let _mockUserService = function() {
        mocks.userServices = {
            getLiked: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProfile");
        _mocks();
        return _inject();
    });

    it("load paginated items", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileLiked", $scope, {user});

        let items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });
        let items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false
        });

        mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, null).promise().resolve(items1);
        mocks.userServices.getLiked.withArgs(user.get("id"), 2, null, null).promise().resolve(items2);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.loadItems().then(() => {
            let expectItems = items1.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.null;

            return ctrl.loadItems().then(() => {
                expectItems = expectItems.concat(items2.get("data"));

                expect(ctrl.items.equals(expectItems)).to.be.true;
                expect(ctrl.scrollDisabled).to.be.true;
                expect(ctrl.type).to.be.null;
                expect(ctrl.q).to.be.null;
                return done();
            });
        });
    });

    it("filter items by text query", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileLiked", $scope, {user});

        let textQuery = "_test_";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileLiked", $scope, {user});

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        let mockPromise = mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        let promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileLiked", $scope, {user});

        let items = Immutable.fromJS({
            data: [],
            next: false
        });

        mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, null).promise().resolve(items);

        expect(ctrl.hasNoResults).to.be.undefined;

        return ctrl.loadItems().then(() => {
            expect(ctrl.hasNoResults).to.be.true;
            return done();
        });
    });
});


describe("ProfileVoted", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let user = Immutable.fromJS({id: 2});

    let _mockUserService = function() {
        mocks.userServices = {
            getVoted: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProfile");
        _mocks();
        return _inject();
    });

    it("load paginated items", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });
        let items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, null).promise().resolve(items1);
        mocks.userServices.getVoted.withArgs(user.get("id"), 2, null, null).promise().resolve(items2);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.loadItems().then(() => {
            let expectItems = items1.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.null;

            return ctrl.loadItems().then(() => {
                expectItems = expectItems.concat(items2.get("data"));

                expect(ctrl.items.equals(expectItems)).to.be.true;
                expect(ctrl.scrollDisabled).to.be.true;
                expect(ctrl.type).to.be.null;
                expect(ctrl.q).to.be.null;
                return done();
            });
        });
    });

    it("filter items by text query", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let textQuery = "_test_";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show only items of epics", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let type = "epic";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showEpicsOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of user stories", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let type = "userstory";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showUserStoriesOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of tasks", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let type = "task";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showTasksOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of issues", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let type = "issue";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showIssuesOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        let mockPromise = mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        let promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileVoted", $scope, {user});

        let items = Immutable.fromJS({
            data: [],
            next: false
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, null).promise().resolve(items);

        expect(ctrl.hasNoResults).to.be.undefined;

        return ctrl.loadItems().then(() => {
            expect(ctrl.hasNoResults).to.be.true;
            return done();
        });
    });
});

describe("ProfileWatched", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let user = Immutable.fromJS({id: 2});

    let _mockUserService = function() {
        mocks.userServices = {
            getWatched: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProfile");
        _mocks();
        return _inject();
    });

    it("load paginated items", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });
        let items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, null).promise().resolve(items1);
        mocks.userServices.getWatched.withArgs(user.get("id"), 2, null, null).promise().resolve(items2);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.loadItems().then(() => {
            let expectItems = items1.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.null;

            return ctrl.loadItems().then(() => {
                expectItems = expectItems.concat(items2.get("data"));

                expect(ctrl.items.equals(expectItems)).to.be.true;
                expect(ctrl.scrollDisabled).to.be.true;
                expect(ctrl.type).to.be.null;
                expect(ctrl.q).to.be.null;
                return done();
            });
        });
    });

    it("filter items by text query", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let textQuery = "_test_";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show only items of projects", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let type = "project";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showProjectsOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of epics", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let type = "epic";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showEpicsOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of user stories", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let type = "userstory";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showUserStoriesOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of tasks", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let type = "task";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showTasksOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of issues", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let type = "issue";

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showIssuesOnly().then(() => {
            let expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ],
            next: true
        });

        let mockPromise = mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        let promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        let $scope = $rootScope.$new();
        let ctrl = $controller("ProfileWatched", $scope, {user});

        let items = Immutable.fromJS({
            data: [],
            next: false
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, null).promise().resolve(items);

        expect(ctrl.hasNoResults).to.be.undefined;

        return ctrl.loadItems().then(() => {
            expect(ctrl.hasNoResults).to.be.true;
            return done();
        });
    });
});
