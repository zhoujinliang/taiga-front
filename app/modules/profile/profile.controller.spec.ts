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
 * File: profile.controller.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("ProfileController", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    let mocks:any = {};

    let projects = Immutable.fromJS([
        {id: 1},
        {id: 2},
        {id: 3}
    ]);

    let _mockTranslate = function() {
        mocks.translate = {};
        mocks.translate.instant = sinon.stub();

        return provide.value("$translate", mocks.translate);
    };

    let _mockAppMetaService = function() {
        mocks.appMetaService = {
            setAll: sinon.spy()
        };

        return provide.value("tgAppMetaService", mocks.appMetaService);
    };

    let _mockCurrentUser = function() {
        mocks.currentUser = {
            getUser: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUser);
    };

    let _mockUserService = function() {
        mocks.userService = {
            getUserByUserName: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userService);
    };

    let _mockRouteParams = function() {
        mocks.routeParams = {};

        return provide.value("$routeParams", mocks.routeParams);
    };

    let _mockXhrErrorService = function() {
        mocks.xhrErrorService = {
            response: sinon.spy(),
            notFound: sinon.spy()
        };

        return provide.value("tgXhrErrorService", mocks.xhrErrorService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTranslate();
            _mockAppMetaService();
            _mockCurrentUser();
            _mockRouteParams();
            _mockUserService();
            _mockXhrErrorService();
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

    it("define external user", function(done) {
        let $scope = $rootScope.$new();

        mocks.routeParams.slug = "user-slug";

        let user = Immutable.fromJS({
            username: "username",
            full_name_display: "full-name-display",
            bio: "bio",
            is_active: true
        });

        mocks.translate.instant
            .withArgs('USER.PROFILE.PAGE_TITLE', {
                userFullName: user.get("full_name_display"),
                userUsername: user.get("username")
            })
            .returns('user-profile-page-title');

        mocks.userService.getUserByUserName.withArgs(mocks.routeParams.slug).promise().resolve(user);

        let ctrl = $controller("Profile");

        return setTimeout(( function() {
            expect(ctrl.user).to.be.equal(user);
            expect(ctrl.isCurrentUser).to.be.false;
            expect(mocks.appMetaService.setAll.calledWithExactly("user-profile-page-title", "bio")).to.be.true;
            return done();
        })
        );
    });

    it("non-existent user", function(done) {
        let $scope = $rootScope.$new();

        mocks.routeParams.slug = "user-slug";

        let error = new Error('404');

        mocks.userService.getUserByUserName.withArgs(mocks.routeParams.slug).promise().reject(error);

        let ctrl = $controller("Profile");

        return setTimeout(( function() {
            expect(mocks.xhrErrorService.response.withArgs(error)).to.be.calledOnce;
            return done();
        })
        );
    });

    it("define current user", function(done) {
        let $scope = $rootScope.$new();

        let user = Immutable.fromJS({
            username: "username",
            full_name_display: "full-name-display",
            bio: "bio",
            is_active: true
        });

        mocks.translate.instant
            .withArgs('USER.PROFILE.PAGE_TITLE', {
                userFullName: user.get("full_name_display"),
                userUsername: user.get("username")
            })
            .returns('user-profile-page-title');

        mocks.currentUser.getUser.returns(user);

        let ctrl = $controller("Profile");

        return setTimeout(( function() {
            expect(ctrl.user).to.be.equal(user);
            expect(ctrl.isCurrentUser).to.be.true;
            expect(mocks.appMetaService.setAll.withArgs("user-profile-page-title", "bio")).to.be.calledOnce;
            return done();
        })
        );
    });

    return it("non-active user", function(done) {
        let $scope = $rootScope.$new();

        mocks.routeParams.slug = "user-slug";

        let user = Immutable.fromJS({
            username: "username",
            full_name_display: "full-name-display",
            bio: "bio",
            is_active: false
        });

        mocks.userService.getUserByUserName.withArgs(mocks.routeParams.slug).promise().resolve(user);

        let ctrl = $controller("Profile");

        return setTimeout(( function() {
            expect(mocks.xhrErrorService.notFound).to.be.calledOnce;
            return done();
        })
        );
    });
});
