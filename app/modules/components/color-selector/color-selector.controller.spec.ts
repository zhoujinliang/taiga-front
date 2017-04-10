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
 * File: color-selector.controller.spec.coffee
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

describe("ColorSelector", function() {
    let provide = null;
    let controller = null;
    let colorSelectorCtrl = null;
    let mocks:any = {};

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            hasPermission: sinon.stub()
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgProjectService();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaComponents");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("require Color on Selector", function() {
        colorSelectorCtrl = controller("ColorSelectorCtrl");
        colorSelectorCtrl.colorList = ["#000000", "#123123"];
        colorSelectorCtrl.isColorRequired = false;
        colorSelectorCtrl.checkIsColorRequired();
        return expect(colorSelectorCtrl.colorList).to.be.eql(["#000000"]);
    });

    it("display Color Selector", function() {
        colorSelectorCtrl = controller("ColorSelectorCtrl");
        colorSelectorCtrl.toggleColorList();
        return expect(colorSelectorCtrl.displayColorList).to.be.true;
    });

    it("on select Color", function() {
        colorSelectorCtrl = controller("ColorSelectorCtrl");
        colorSelectorCtrl.toggleColorList = sinon.stub();

        let color = '#FFFFFF';

        colorSelectorCtrl.onSelectColor = sinon.spy();

        colorSelectorCtrl.onSelectDropdownColor(color);
        expect(colorSelectorCtrl.toggleColorList).have.been.called;
        return expect(colorSelectorCtrl.onSelectColor).to.have.been.calledWith({color});
    });

    return it("save on keydown Enter", function() {
        colorSelectorCtrl = controller("ColorSelectorCtrl");
        colorSelectorCtrl.onSelectDropdownColor = sinon.stub();

        let event = {which: 13, preventDefault: sinon.stub()};
        let customColor = "#fabada";

        colorSelectorCtrl.customColor = customColor;

        colorSelectorCtrl.onKeyDown(event);
        expect(event.preventDefault).have.been.called;
        expect(colorSelectorCtrl.onSelectDropdownColor).have.been.called;
        return expect(colorSelectorCtrl.onSelectDropdownColor).have.been.calledWith(customColor);
    });
});
