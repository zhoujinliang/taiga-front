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
 * File: filter.controller.spec.coffee
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

describe("Filter", function() {
    const $provide = null;
    let $controller = null;
    const mocks: any = {};

    const _inject = () =>
        inject((_$controller_) => $controller = _$controller_)
    ;

    const _setup = () => _inject();

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("toggle filter category", function() {
        const ctrl = $controller("Filter");

        ctrl.toggleFilterCategory("filter1");

        expect(ctrl.opened).to.be.equal("filter1");

        ctrl.toggleFilterCategory("filter1");

        return expect(ctrl.opened).to.be.null;
    });

    it("is filter open", function() {
        const ctrl = $controller("Filter");
        ctrl.opened = "filter1";

        const isOpen = ctrl.isOpen("filter1");

        return expect(isOpen).to.be.true;
    });

    it("save custom filter", function() {
        const ctrl = $controller("Filter");
        ctrl.customFilterName = "custom-name";
        ctrl.customFilterForm = true;
        ctrl.onSaveCustomFilter = sinon.spy();

        ctrl.saveCustomFilter();

        expect(ctrl.onSaveCustomFilter).to.have.been.calledWith({name: "custom-name"});
        expect(ctrl.customFilterForm).to.be.false;
        expect(ctrl.opened).to.be.equal("custom-filter");
        return expect(ctrl.customFilterName).to.be.equal("");
    });

    return it("is filter selected", function() {
        const ctrl = $controller("Filter");
        ctrl.selectedFilters = [
            {id: 1, dataType: "1"},
            {id: 2, dataType: "2"},
            {id: 3, dataType: "3"},
        ];

        let filterCategory = {dataType: "x"};
        let filter = {id: 1};
        let isFilterSelected = ctrl.isFilterSelected(filterCategory, filter);

        expect(isFilterSelected).to.be.false;

        filterCategory = {dataType: "1"};
        filter = {id: 1};
        isFilterSelected = ctrl.isFilterSelected(filterCategory, filter);

        return expect(isFilterSelected).to.be.true;
    });
});
