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
 * File: doscover-search-bar.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("DiscoverSearchBarController", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockDiscoverProjectsService = function() {
        mocks.discoverProjectsService = {
            fetchStats: sinon.spy()
        };

        return $provide.value('tgDiscoverProjectsService', mocks.discoverProjectsService);
    };

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockDiscoverProjectsService();

            return null;
        })
    ;

    let _setup = () => _inject();

    beforeEach(function() {
        module("taigaDiscover");

        _mocks();
        return _setup();
    });

    it("select filter", function() {
        let ctrl = $controller("DiscoverSearchBar");
        ctrl.onChange = sinon.spy();
        ctrl.q = 'query';

        ctrl.selectFilter('text');

        expect(mocks.discoverProjectsService.fetchStats).to.have.been.called;
        return expect(ctrl.onChange).to.have.been.calledWith(sinon.match({filter: 'text', q: 'query'}));
    });

    return it("submit filter", function() {
        let ctrl = $controller("DiscoverSearchBar");
        ctrl.filter = 'all';
        ctrl.q = 'query';
        ctrl.onChange = sinon.spy();

        ctrl.submitFilter();

        expect(mocks.discoverProjectsService.fetchStats).to.have.been.called;
        return expect(ctrl.onChange).to.have.been.calledWith(sinon.match({filter: 'all', q: 'query'}));
    });
});
