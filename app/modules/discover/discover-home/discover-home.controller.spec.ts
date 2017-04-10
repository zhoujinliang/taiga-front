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
 * File: doscover-home.controller.spec.coffee
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

describe("DiscoverHomeController", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockTranslate = function() {
        mocks.translate = {};
        mocks.translate.instant = sinon.stub();

        return $provide.value("$translate", mocks.translate);
    };

    let _mockAppMetaService = function() {
        mocks.appMetaService = {
            setAll: sinon.spy()
        };

        return $provide.value("tgAppMetaService", mocks.appMetaService);
    };

    let _mockLocation = function() {
        mocks.location = {};

        return $provide.value('$tgLocation', mocks.location);
    };

    let _mockNavUrls = function() {
        mocks.navUrls = {};

        return $provide.value('$tgNavUrls', mocks.navUrls);
    };

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockTranslate();
            _mockAppMetaService();
            _mockLocation();
            _mockNavUrls();

            return null;
        })
    ;

    let _setup = () => _inject();

    beforeEach(function() {
        module("taigaDiscover");

        _mocks();
        return _setup();
    });

    it("initialize meta data", function() {
        mocks.translate.instant
            .withArgs('DISCOVER.PAGE_TITLE')
            .returns('meta-title');
        mocks.translate.instant
            .withArgs('DISCOVER.PAGE_DESCRIPTION')
            .returns('meta-description');

        let ctrl = $controller('DiscoverHome');

        return expect(mocks.appMetaService.setAll.calledWithExactly("meta-title", "meta-description")).to.be.true;
    });

    return it("onSubmit redirect to discover search", function() {
        mocks.navUrls.resolve = sinon.stub().withArgs('discover-search').returns('url');

        let pathSpy = sinon.spy();
        let searchStub = {
            path: pathSpy
        };

        mocks.location.search = sinon.stub().withArgs('text', 'query').returns(searchStub);

        let ctrl = $controller("DiscoverHome");

        ctrl.onSubmit('query');

        return expect(pathSpy).to.have.been.calledWith('url');
    });
});
