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
 * File: external-app.controller.spec.coffee
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

describe("ExternalAppController", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    const mocks: any = {};

    const _inject = (callback= null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    const _mockRouteParams = function() {
        mocks.routeParams = {};
        return provide.value("$routeParams", mocks.routeParams);
    };

    const _mockTgExternalAppsService = function() {
        mocks.tgExternalAppsService = {
            getApplicationToken: sinon.stub(),
            authorizeApplicationToken: sinon.stub(),
        };
        return provide.value("tgExternalAppsService", mocks.tgExternalAppsService);
    };

    const _mockWindow = function() {
        mocks.window = {
            open: sinon.stub(),
            history: {
                back: sinon.stub(),
            },
        };
        return provide.value("$window", mocks.window);
    };

    const _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            getUser: sinon.stub(),
        };
        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    const _mockLocation = function() {
        mocks.location = {
            url: sinon.stub(),
        };
        return provide.value("$location", mocks.location);
    };

    const _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub(),
        };
        return provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    const _mockTgXhrErrorService = function() {
        mocks.tgXhrErrorService = {
            response: sinon.spy(),
            notFound: sinon.spy(),
        };
        return provide.value("tgXhrErrorService", mocks.tgXhrErrorService);
    };

    const _mockTgLoader = function() {
        mocks.tgLoader = {
            start: sinon.stub(),
            pageLoaded: sinon.stub(),
        };
        return provide.value("tgLoader", mocks.tgLoader);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockRouteParams();
            _mockTgExternalAppsService();
            _mockWindow();
            _mockTgCurrentUserService();
            _mockLocation();
            _mockTgNavUrls();
            _mockTgXhrErrorService();
            _mockTgLoader();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaExternalApps");
        _mocks();
        return _inject();
    });

    it("not existing application", function(done) {
        const $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        const error = new Error("404");

        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().reject(error);

        const ctrl = $controller("ExternalApp");

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.tgXhrErrorService.response.withArgs(error)).to.be.calledOnce;
            return done();
        }),
        );
    });

    it("existing application and existing token, automatically redirecting to next url", function(done) {
        const $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        const applicationToken = Immutable.fromJS({
            auth_code: "testing-auth-code",
            next_url: "http://next.url",
        });

        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        const ctrl = $controller("ExternalApp");

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.window.open.callCount).to.be.equal(1);
            expect(mocks.window.open.calledWith("http://next.url")).to.be.true;
            return done();
        }),
        );
    });

    it("existing application and creating new token", function(done) {
        const $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        let applicationToken = Immutable.fromJS({});
        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        const ctrl = $controller("ExternalApp");

        applicationToken = Immutable.fromJS({
            next_url: "http://next.url",
            auth_code: "testing-auth-code",
        });

        mocks.tgExternalAppsService.authorizeApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        ctrl.createApplicationToken();

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.tgLoader.pageLoaded).to.be.calledOnce;
            expect(mocks.window.open.callCount).to.be.equal(1);
            expect(mocks.window.open.calledWith("http://next.url")).to.be.true;
            return done();
        }),
        );
    });

    return it("cancel back to previous url", function() {
        const $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        const applicationToken = Immutable.fromJS({});
        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        const ctrl = $controller("ExternalApp");
        expect(mocks.window.history.back.callCount).to.be.equal(0);
        ctrl.cancel();
        return expect(mocks.window.history.back.callCount).to.be.equal(1);
    });
});
