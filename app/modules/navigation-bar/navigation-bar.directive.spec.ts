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
 * File: navigation-bar.directive.spec.coffee
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

describe("navigationBarDirective", function() {
    let compile, provide;
    let scope = (compile = (provide = null));
    let mocks:any = {};
    let template = "<div tg-navigation-bar></div>";
    let projects = Immutable.fromJS({
        recents: [
            {id: 1},
            {id: 2},
            {id: 3}
        ]
    });

    let createDirective = function() {
        let elm = compile(template)(scope);
        return elm;
    };

    let _mocksCurrentUserService = function() {
        mocks.currentUserService = {
            projects,
            isAuthenticated: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mocksLocationService = function() {
        mocks.locationService = {
            url: sinon.stub(),
            search: sinon.stub()
        };

        return provide.value("$tgLocation", mocks.locationService);
    };

    let _mocksConfig = function() {
        mocks.config =  Immutable.fromJS({
            publicRegisterEnabled: true
        });

        return provide.value("$tgConfig", mocks.config);
    };

    let _mockTgNavUrls = function() {
        mocks.navUrls = {
            resolve: sinon.stub()
        };
        return provide.value("$tgNavUrls", mocks.navUrls);
    };

    let _mockTranslateFilter = function() {
        let mockTranslateFilter = value => value;
        return provide.value("translateFilter", mockTranslateFilter);
    };

    let _mockTgDropdownProjectListDirective = () => provide.factory('tgDropdownProjectListDirective', () => ({}));

    let _mockTgDropdownUserDirective = () => provide.factory('tgDropdownUserDirective', () => ({}));

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;

            _mocksCurrentUserService();
            _mocksLocationService();
            _mockTgNavUrls( );
            _mockTranslateFilter();
            _mockTgDropdownProjectListDirective();
            _mockTgDropdownUserDirective();
            _mocksConfig();

            return null;
        })
    ;

    beforeEach(function() {
        let recents;
        module("templates");
        module("taigaNavigationBar");

        _mocks();

        inject(function($rootScope, $compile) {
            scope = $rootScope.$new();
            return compile = $compile;
        });

        return recents = Immutable.fromJS([
            {
                id:1
            },
            {
                id: 2
            }
        ]);
    });

    it("navigation bar directive scope content", function() {
        let elm = createDirective();
        scope.$apply();
        expect(elm.isolateScope().vm.projects.size).to.be.equal(3);

        mocks.currentUserService.isAuthenticated.returns(true);

        return expect(elm.isolateScope().vm.isAuthenticated).to.be.true;
    });

    return it("navigation bar login", function() {
        mocks.navUrls.resolve.withArgs("login").returns("/login");
        let nextUrl = "/discover/search?order_by=-total_activity_last_month";
        mocks.locationService.url.returns(nextUrl);
        let elm = createDirective();
        scope.$apply();
        let { vm } = elm.isolateScope();
        expect(mocks.locationService.url.callCount).to.be.equal(0);
        expect(mocks.locationService.search.callCount).to.be.equal(0);
        vm.login();
        expect(mocks.locationService.url.callCount).to.be.equal(2);
        expect(mocks.locationService.search.callCount).to.be.equal(1);
        expect(mocks.locationService.url.calledWith("/login")).to.be.true;
        expect(mocks.locationService.search.calledWith({next: encodeURIComponent(nextUrl)})).to.be.true;
        return expect(vm.publicRegisterEnabled).to.be.true;
    });
});
