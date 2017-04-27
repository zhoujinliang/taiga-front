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
 * File: watch-button.controller.spec.coffee
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

describe("WatchButton", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    let mocks: any = {};

    const _mockCurrentUser = function() {
        mocks.currentUser = {
            getUser: sinon.stub(),
        };

        return provide.value("tgCurrentUserService", mocks.currentUser);
    };

    const _mocks = function() {
        mocks = {
            onWatch: sinon.stub(),
            onUnwatch: sinon.stub(),
        };

        return module(function($provide) {
            provide = $provide;
            _mockCurrentUser();
            return null;
        });
    };

    const _inject = (callback= null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    const _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");
        return _setup();
    });

    it("watch", function(done) {
        const $scope = $rootScope.$new();

        mocks.onWatch = (sinon.stub() as any).promise();

        const ctrl = $controller("WatchButton", $scope, {
            item: {is_watcher: false},
            onWatch: mocks.onWatch,
            onUnwatch: mocks.onUnwatch,
        });

        const promise = ctrl.toggleWatch();

        expect(ctrl.loading).to.be.true;

        mocks.onWatch.resolve();

        return promise.finally(function() {
            expect(mocks.onWatch).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    it("unwatch", function(done) {
        const $scope = $rootScope.$new();

        mocks.onUnwatch = (sinon.stub() as any).promise();

        const ctrl = $controller("WatchButton", $scope, {
            item: {is_watcher: true},
            onWatch: mocks.onWatch,
            onUnwatch: mocks.onUnwatch,
        });

        const promise = ctrl.toggleWatch();

        expect(ctrl.loading).to.be.true;

        mocks.onUnwatch.resolve();

        return promise.finally(function() {
            expect(mocks.onUnwatch).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    return it("get permissions", function() {
        const $scope = $rootScope.$new();

        const ctrl = $controller("WatchButton", $scope, {
            item: {_name: "tasks"},
        });

        let perm = ctrl.getPerms();
        expect(perm).to.be.equal("modify_task");

        ctrl.item = {_name: "issues"};

        perm = ctrl.getPerms();
        expect(perm).to.be.equal("modify_issue");

        ctrl.item = {_name: "userstories"};

        perm = ctrl.getPerms();
        return expect(perm).to.be.equal("modify_us");
    });
});
