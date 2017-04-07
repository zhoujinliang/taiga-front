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

describe("WatchButton", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    let mocks = {};

    let _mockCurrentUser = function() {
        mocks.currentUser = {
            getUser: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUser);
    };

    let _mocks = function() {
        mocks = {
            onWatch: sinon.stub(),
            onUnwatch: sinon.stub()
        };

        return module(function($provide) {
            provide = $provide;
            _mockCurrentUser();
            return null;
        });
    };

    let _inject = callback =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");
        return _setup();
    });

    it("watch", function(done) {
        let $scope = $rootScope.$new();

        mocks.onWatch = sinon.stub().promise();

        let ctrl = $controller("WatchButton", $scope, {
            item: {is_watcher: false},
            onWatch: mocks.onWatch,
            onUnwatch: mocks.onUnwatch
        });


        let promise = ctrl.toggleWatch();

        expect(ctrl.loading).to.be.true;

        mocks.onWatch.resolve();

        return promise.finally(function() {
            expect(mocks.onWatch).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    it("unwatch", function(done) {
        let $scope = $rootScope.$new();

        mocks.onUnwatch = sinon.stub().promise();

        let ctrl = $controller("WatchButton", $scope, {
            item: {is_watcher: true},
            onWatch: mocks.onWatch,
            onUnwatch: mocks.onUnwatch
        });

        let promise = ctrl.toggleWatch();

        expect(ctrl.loading).to.be.true;

        mocks.onUnwatch.resolve();

        return promise.finally(function() {
            expect(mocks.onUnwatch).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });


    return it("get permissions", function() {
        let $scope = $rootScope.$new();

        let ctrl = $controller("WatchButton", $scope, {
            item: {_name: 'tasks'}
        });

        let perm = ctrl.getPerms();
        expect(perm).to.be.equal('modify_task');

        ctrl.item = {_name: 'issues'};

        perm = ctrl.getPerms();
        expect(perm).to.be.equal('modify_issue');

        ctrl.item = {_name: 'userstories'};

        perm = ctrl.getPerms();
        return expect(perm).to.be.equal('modify_us');
    });
});
