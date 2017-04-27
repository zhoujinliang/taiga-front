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

declare var describe: any;
declare var angular: any;
const module = angular.mock.module;
declare var inject: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;
import * as Immutable from "immutable";
declare var sinon: any;

describe("ProfileLiked", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    const mocks: any = {};

    const user = Immutable.fromJS({id: 2});

    const _mockUserService = function() {
        mocks.userServices = {
            getLiked: sinon.stub(),
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    const _inject = (callback= null) =>
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileLiked", $scope, {user});

        const items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });
        const items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false,
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileLiked", $scope, {user});

        const textQuery = "_test_";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileLiked", $scope, {user});

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        const mockPromise = mocks.userServices.getLiked.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        const promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileLiked", $scope, {user});

        const items = Immutable.fromJS({
            data: [],
            next: false,
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
    const mocks: any = {};

    const user = Immutable.fromJS({id: 2});

    const _mockUserService = function() {
        mocks.userServices = {
            getVoted: sinon.stub(),
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    const _inject = (callback= null) =>
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });
        const items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false,
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const textQuery = "_test_";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show only items of epics", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const type = "epic";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showEpicsOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of user stories", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const type = "userstory";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showUserStoriesOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of tasks", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const type = "task";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showTasksOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of issues", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const type = "issue";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getVoted.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showIssuesOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        const mockPromise = mocks.userServices.getVoted.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        const promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileVoted", $scope, {user});

        const items = Immutable.fromJS({
            data: [],
            next: false,
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
    const mocks: any = {};

    const user = Immutable.fromJS({id: 2});

    const _mockUserService = function() {
        mocks.userServices = {
            getWatched: sinon.stub(),
        };

        return provide.value("tgUserService", mocks.userServices);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    const _inject = (callback= null) =>
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const items1 = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });
        const items2 = Immutable.fromJS({
            data: [
                {id: 4},
                {id: 5},
            ],
            next: false,
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
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const textQuery = "_test_";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, textQuery).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        ctrl.q = textQuery;

        return ctrl.loadItems().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.null;
            expect(ctrl.q).to.be.equal(textQuery);
            return done();
        });
    });

    it("show only items of projects", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const type = "project";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showProjectsOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of epics", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const type = "epic";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showEpicsOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of user stories", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const type = "userstory";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showUserStoriesOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of tasks", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const type = "task";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showTasksOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show only items of issues", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const type = "issue";

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, type, null).promise().resolve(items);

        expect(ctrl.items.size).to.be.equal(0);
        expect(ctrl.scrollDisabled).to.be.false;
        expect(ctrl.type).to.be.null;
        expect(ctrl.q).to.be.null;

        return ctrl.showIssuesOnly().then(() => {
            const expectItems = items.get("data");

            expect(ctrl.items.equals(expectItems)).to.be.true;
            expect(ctrl.scrollDisabled).to.be.false;
            expect(ctrl.type).to.be.type;
            expect(ctrl.q).to.be.null;
            return done();
        });
    });

    it("show loading spinner during the call to the api", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const items = Immutable.fromJS({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
            next: true,
        });

        const mockPromise = mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, null).promise();

        expect(ctrl.isLoading).to.be.undefined;

        const promise = ctrl.loadItems();

        expect(ctrl.isLoading).to.be.true;

        mockPromise.resolve(items);

        return promise.then(() => {
            expect(ctrl.isLoading).to.be.false;
            return done();
        });
    });

    return it("show no results placeholder", function(done) {
        const $scope = $rootScope.$new();
        const ctrl = $controller("ProfileWatched", $scope, {user});

        const items = Immutable.fromJS({
            data: [],
            next: false,
        });

        mocks.userServices.getWatched.withArgs(user.get("id"), 1, null, null).promise().resolve(items);

        expect(ctrl.hasNoResults).to.be.undefined;

        return ctrl.loadItems().then(() => {
            expect(ctrl.hasNoResults).to.be.true;
            return done();
        });
    });
});
