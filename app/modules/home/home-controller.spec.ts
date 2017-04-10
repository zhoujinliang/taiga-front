/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: home.controller.spec.coffee
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

describe("HomeController", function() {
    let homeCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            getUser: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockLocation = function() {
        mocks.location = {
            path: sinon.stub()
        };
        return provide.value("$location", mocks.location);
    };

    let _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub()
        };

        return provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockCurrentUserService();
            _mockLocation();
            _mockTgNavUrls();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaHome");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("anonymous home", function() {
        homeCtrl = controller("Home",
            {$scope: {}});

        expect(mocks.tgNavUrls.resolve).to.be.calledWith("discover");
        return expect(mocks.location.path).to.be.calledOnce;
    });

    return it("non anonymous home", function() {
        mocks.currentUserService = {
            getUser: Immutable.fromJS({
                id: 1
            })
        };

        expect(mocks.tgNavUrls.resolve).to.be.notCalled;
        return expect(mocks.location.path).to.be.notCalled;
    });
});
