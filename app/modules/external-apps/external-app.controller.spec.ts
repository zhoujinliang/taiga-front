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

describe("ExternalAppController", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    let mocks = {};

    let _inject = callback =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    let _mockRouteParams = function() {
        mocks.routeParams = {};
        return provide.value("$routeParams", mocks.routeParams);
    };

    let _mockTgExternalAppsService = function() {
        mocks.tgExternalAppsService = {
            getApplicationToken: sinon.stub(),
            authorizeApplicationToken: sinon.stub()
        };
        return provide.value("tgExternalAppsService", mocks.tgExternalAppsService);
    };

    let _mockWindow = function() {
        mocks.window = {
            open: sinon.stub(),
            history: {
                back: sinon.stub()
            }
        };
        return provide.value("$window", mocks.window);
    };

    let _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            getUser: sinon.stub()
        };
        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    let _mockLocation = function() {
        mocks.location = {
            url: sinon.stub()
        };
        return provide.value("$location", mocks.location);
    };

    let _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub()
        };
        return provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    let _mockTgXhrErrorService = function() {
        mocks.tgXhrErrorService = {
            response: sinon.spy(),
            notFound: sinon.spy()
        };
        return provide.value("tgXhrErrorService", mocks.tgXhrErrorService);
    };

    let _mockTgLoader = function() {
        mocks.tgLoader = {
            start: sinon.stub(),
            pageLoaded: sinon.stub()
        };
        return provide.value("tgLoader", mocks.tgLoader);
    };

    let _mocks = () =>
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
        let $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        let error = new Error('404');

        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().reject(error);

        let ctrl = $controller("ExternalApp");

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.tgXhrErrorService.response.withArgs(error)).to.be.calledOnce;
            return done();
        })
        );
    });

    it("existing application and existing token, automatically redirecting to next url", function(done) {
        let $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        let applicationToken = Immutable.fromJS({
            auth_code: "testing-auth-code",
            next_url: "http://next.url"
        });

        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        let ctrl = $controller("ExternalApp");

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.window.open.callCount).to.be.equal(1);
            expect(mocks.window.open.calledWith("http://next.url")).to.be.true;
            return done();
        })
        );
    });

    it("existing application and creating new token", function(done) {
        let $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        let applicationToken = Immutable.fromJS({});
        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        let ctrl = $controller("ExternalApp");

        applicationToken = Immutable.fromJS({
            next_url: "http://next.url",
            auth_code: "testing-auth-code"
        });

        mocks.tgExternalAppsService.authorizeApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        ctrl.createApplicationToken();

        return setTimeout(( function() {
            expect(mocks.tgLoader.start.withArgs(false)).to.be.calledOnce;
            expect(mocks.tgLoader.pageLoaded).to.be.calledOnce;
            expect(mocks.window.open.callCount).to.be.equal(1);
            expect(mocks.window.open.calledWith("http://next.url")).to.be.true;
            return done();
        })
        );
    });

    return it("cancel back to previous url", function() {
        let $scope = $rootScope.$new();

        mocks.routeParams.application = 6;
        mocks.routeParams.state = "testing-state";

        let applicationToken = Immutable.fromJS({});
        mocks.tgExternalAppsService.getApplicationToken.withArgs(mocks.routeParams.application, mocks.routeParams.state).promise().resolve(applicationToken);

        let ctrl = $controller("ExternalApp");
        expect(mocks.window.history.back.callCount).to.be.equal(0);
        ctrl.cancel();
        return expect(mocks.window.history.back.callCount).to.be.equal(1);
    });
});
