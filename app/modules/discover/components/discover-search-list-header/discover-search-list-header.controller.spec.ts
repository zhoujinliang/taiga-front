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
 * File: discover-search-list-header.controller.spec.coffee
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

describe("DiscoverSearchListHeader", function() {
    let $provide = null;
    let $controller = null;
    let scope = null;

    let _inject = () =>
        inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            return scope = $rootScope.$new();
        })
    ;

    let _setup = () => _inject();

    beforeEach(function() {
        module("taigaDiscover");

        return _setup();
    });

    it("openLike", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: ''
        });

        ctrl.like_is_open = false;
        ctrl.activity_is_open = true;
        ctrl.setOrderBy = sinon.spy();

        ctrl.openLike();

        expect(ctrl.like_is_open).to.be.true;
        expect(ctrl.activity_is_open).to.be.false;
        return expect(ctrl.setOrderBy).have.been.calledWith('-total_fans_last_week');
    });

    it("openActivity", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: ''
        });

        ctrl.activity_is_open = false;
        ctrl.like_is_open = true;
        ctrl.setOrderBy = sinon.spy();

        ctrl.openActivity();

        expect(ctrl.activity_is_open).to.be.true;
        expect(ctrl.like_is_open).to.be.false;
        return expect(ctrl.setOrderBy).have.been.calledWith('-total_activity_last_week');
    });

    it("setOrderBy", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: ''
        });

        ctrl.onChange = sinon.spy();

        ctrl.setOrderBy("type1");

        return expect(ctrl.onChange).to.have.been.calledWith(sinon.match({orderBy: "type1"}));
    });

    it("setOrderBy falsy close the like or activity layer", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: ''
        });

        ctrl.like_is_open = true;
        ctrl.activity_is_open = true;

        ctrl.onChange = sinon.spy();

        ctrl.setOrderBy();

        expect(ctrl.onChange).to.have.been.calledWith(sinon.match({orderBy: ''}));
        expect(ctrl.like_is_open).to.be.false;
        return expect(ctrl.activity_is_open).to.be.false;
    });

    it("closed like & activity", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: ''
        });

        expect(ctrl.like_is_open).to.be.false;
        return expect(ctrl.activity_is_open).to.be.false;
    });

    it("open like", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: '-total_fans'
        });

        expect(ctrl.like_is_open).to.be.true;
        return expect(ctrl.activity_is_open).to.be.false;
    });

    return it("open activity", function() {
        let ctrl = $controller("DiscoverSearchListHeader", scope, {
            orderBy: '-total_activity'
        });

        expect(ctrl.like_is_open).to.be.false;
        return expect(ctrl.activity_is_open).to.be.true;
    });
});
