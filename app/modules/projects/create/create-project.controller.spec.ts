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
 * File: create-project.controller.spec.coffee
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

describe("CreateProjectController", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _inject = (callback=null) =>
        inject((_$controller_, _$q_, _$rootScope_) => controller = _$controller_)
    ;

    return beforeEach(function() {
        module("taigaProjects");
        return _inject();
    });
});

    // it "get Home Step", () ->
    //     ctrl = controller "CreateProjectCtrl"
    //     ctrl.inDefaultStep = true
    //     ctrl.getStep('home')
    //     expect(ctrl.inDefaultStep).to.be.true
    //     expect(ctrl.inStepDuplicateProject).to.be.false
    //
    // it "get Duplicate Project Step", () ->
    //     ctrl = controller "CreateProjectCtrl"
    //     ctrl.inDefaultStep = true
    //     ctrl.getStep('duplicate')
    //     expect(ctrl.inDefaultStep).to.be.false
    //     expect(ctrl.inStepDuplicateProject).to.be.true
