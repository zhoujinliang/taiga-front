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
 * File: most-active.controller.spec.coffee
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

describe("MostActive", function() {
    let $provide = null;
    let $controller = null;
    const mocks: any = {};

    const _mockDiscoverProjectsService = function() {
        mocks.discoverProjectsService = {
            fetchMostActive: sinon.stub(),
        };

        return $provide.value("tgDiscoverProjectsService", mocks.discoverProjectsService);
    };

    const _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockDiscoverProjectsService();

            return null;
        })
    ;

    const _inject = () =>
        inject((_$controller_) => $controller = _$controller_)
    ;

    const _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaDiscover");

        return _setup();
    });

    it("fetch", function(done) {
        const ctrl = $controller("MostActive");

        ctrl.getOrderBy = sinon.stub().returns("week");

        const mockPromise = mocks.discoverProjectsService.fetchMostActive.withArgs(sinon.match({order_by: "week"})).promise();

        const promise = ctrl.fetch();

        expect(ctrl.loading).to.be.true;

        mockPromise.resolve();

        return promise.finally(function() {
            expect(ctrl.loading).to.be.false;
            return done();
        });
    });

    return it("order by", function() {
        const ctrl = $controller("MostActive");

        ctrl.fetch = sinon.spy();

        ctrl.orderBy("month");

        expect(ctrl.fetch).to.have.been.called;
        return expect(ctrl.currentOrderBy).to.be.equal("month");
    });
});
