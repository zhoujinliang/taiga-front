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
 * File: contact-project-button.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("ContactProjectButton", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgLightboxFactory = function() {
        mocks.tgLightboxFactory = {
            create: sinon.stub()
        };

        return provide.value("tgLightboxFactory", mocks.tgLightboxFactory);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgLightboxFactory();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");

        _mocks();

        return inject($controller => controller = $controller);
    });

    return it("Launch Contact Form", function() {
        let ctrl = controller("ContactProjectButtonCtrl");
        ctrl.launchContactForm();
        return expect(mocks.tgLightboxFactory.create).have.been.called;
    });
});
