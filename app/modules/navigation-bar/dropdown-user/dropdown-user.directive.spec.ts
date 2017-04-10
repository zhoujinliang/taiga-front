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
 * File: dropdown-user.directive.spec.coffee
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

describe("dropdownUserDirective", function() {
    let compile, provide;
    let scope = (compile = (provide = null));
    let mockTgAuth = null;
    let mockTgConfig = null;
    let mockTgLocation = null;
    let mockTgNavUrls = null;
    let mockTgFeedbackService = null;
    let template = "<div tg-dropdown-user></div>";

    let createDirective = function() {
        let elm = compile(template)(scope);
        return elm;
    };

    let _mockTranslateFilter = function() {
        let mockTranslateFilter = value => value;
        return provide.value("translateFilter", mockTranslateFilter);
    };

    let _mockTgAuth = function() {
        mockTgAuth = {
            userData: Immutable.fromJS({id: 66}),
            logout: sinon.stub()
        };
        return provide.value("$tgAuth", mockTgAuth);
    };

    let _mockTgConfig = function() {
        mockTgConfig = {
            get: sinon.stub()
        };
        return provide.value("$tgConfig", mockTgConfig);
    };

    let _mockTgLocation = function() {
        mockTgLocation = {
            url: sinon.stub(),
            search: sinon.stub()
        };

        return provide.value("$tgLocation", mockTgLocation);
    };

    let _mockTgNavUrls = function() {
        mockTgNavUrls = {
            resolve: sinon.stub()
        };
        return provide.value("$tgNavUrls", mockTgNavUrls);
    };

    let _mockTgFeedbackService = function() {
        mockTgFeedbackService = {
            sendFeedback: sinon.stub()
        };
        return provide.value("tgFeedbackService", mockTgFeedbackService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTranslateFilter();
            _mockTgAuth();
            _mockTgConfig();
            _mockTgLocation();
            _mockTgNavUrls();
            _mockTgFeedbackService();
            return null;
        })
    ;

    beforeEach(function() {
        module("templates");
        module("taigaNavigationBar");

        _mocks();

        return inject(function($rootScope, $compile) {
            scope = $rootScope.$new();
            return compile = $compile;
        });
    });

    it("dropdown user directive scope content", function() {
        mockTgConfig.get.withArgs("feedbackEnabled").returns(true);
        let elm = createDirective();
        scope.$apply();

        let { vm } = elm.isolateScope();
        expect(vm.user.get("id")).to.be.equal(66);
        return expect(vm.isFeedbackEnabled).to.be.equal(true);
    });

    it("dropdown user log out", function() {
        mockTgNavUrls.resolve.withArgs("discover").returns("/discover");
        let elm = createDirective();
        scope.$apply();
        let { vm } = elm.isolateScope();
        expect(mockTgAuth.logout.callCount).to.be.equal(0);
        expect(mockTgLocation.url.callCount).to.be.equal(0);
        expect(mockTgLocation.search.callCount).to.be.equal(0);
        vm.logout();
        expect(mockTgAuth.logout.callCount).to.be.equal(1);
        expect(mockTgLocation.url.callCount).to.be.equal(1);
        expect(mockTgLocation.search.callCount).to.be.equal(1);
        expect(mockTgLocation.url.calledWith("/discover")).to.be.true;
        return expect(mockTgLocation.search.calledWith({})).to.be.true;
    });

    return it("dropdown user send feedback", function() {
        let elm = createDirective();
        scope.$apply();
        let { vm } = elm.isolateScope();
        expect(mockTgFeedbackService.sendFeedback.callCount).to.be.equal(0);
        vm.sendFeedback();
        return expect(mockTgFeedbackService.sendFeedback.callCount).to.be.equal(1);
    });
});
