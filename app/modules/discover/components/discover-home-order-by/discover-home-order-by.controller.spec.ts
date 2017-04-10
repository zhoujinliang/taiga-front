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
 * File: discover-home-order-by.controller.spec.coffee
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

describe("DiscoverHomeOrderBy", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return $provide.value("$translate", mocks.translate);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockTranslate();

            return null;
        })
    ;

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaDiscover");

        return _setup();
    });

    it("get current search text", function() {
        mocks.translate.instant.withArgs('DISCOVER.FILTERS.WEEK').returns('week');
        mocks.translate.instant.withArgs('DISCOVER.FILTERS.MONTH').returns('month');

        let ctrl = $controller("DiscoverHomeOrderBy");

        ctrl.currentOrderBy = 'week';
        let text = ctrl.currentText();

        expect(text).to.be.equal('week');

        ctrl.currentOrderBy = 'month';
        text = ctrl.currentText();

        return expect(text).to.be.equal('month');
    });

    it("open", function() {
        let ctrl = $controller("DiscoverHomeOrderBy");

        ctrl.is_open = false;

        ctrl.open();

        return expect(ctrl.is_open).to.be.true;
    });

    it("close", function() {
        let ctrl = $controller("DiscoverHomeOrderBy");

        ctrl.is_open = true;

        ctrl.close();

        return expect(ctrl.is_open).to.be.false;
    });

    return it("order by", function() {
        let ctrl = $controller("DiscoverHomeOrderBy");
        ctrl.onChange = sinon.spy();

        ctrl.orderBy('week');


        expect(ctrl.currentOrderBy).to.be.equal('week');
        expect(ctrl.is_open).to.be.false;
        return expect(ctrl.onChange).to.have.been.calledWith({orderBy: 'week'});
    });
});
