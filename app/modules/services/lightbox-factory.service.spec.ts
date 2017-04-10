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
 * File: lightbox-factory.service.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
declare var sinon:any;
import * as Immutable from "immutable"

describe("tgLightboxFactory", function() {
    let provide;
    let lightboxFactoryService = (provide = null);
    let mocks:any = {};

    let _mockRootScope = function() {
        mocks.rootScope = sinon.stub();
        return provide.value("$rootScope", {$new: mocks.rootScope});
    };

    let _mockCompile = function() {
        mocks.compile = sinon.stub();
        let fn = () => "<p id='fake'>fake</p>";
        mocks.compile.returns(fn);
        return provide.value("$compile", mocks.compile);
    };

    let _inject = (callback=null) =>
        inject(function(_tgLightboxFactory_) {
            lightboxFactoryService = _tgLightboxFactory_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockRootScope();
            _mockCompile();

            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaCommon");
        _setup();
        return _inject();
    });

    it("insert directive", function() {
        lightboxFactoryService.create("fake-directive");

        return expect($(document.body).find("#fake")).to.have.length(1);
    });

    it("directive must have the tg-bind-scope directive", function() {
        lightboxFactoryService.create("fake-directive");

        let checkDirective = sinon.match(( value => value.attr("tg-bind-scope")), "checkDirective");

        return expect(mocks.compile.withArgs(checkDirective)).to.have.been.calledOnce;
    });

    it("custom attributes", function() {
        let attrs = {
            "class": "x1",
            "id": "x2"
        };

        lightboxFactoryService.create("fake-directive", attrs);

        let checkAttributes = sinon.match(( value => value.hasClass("x1") && (value.attr("id") === "x2") && value.hasClass("remove-on-close")), "checkAttributes");

        return expect(mocks.compile.withArgs(checkAttributes)).to.have.been.calledOnce;
    });

    return it("directive has class remove-on-close", function() {
        lightboxFactoryService.create("fake-directive");

        let checkClass = sinon.match(( value => value.hasClass("remove-on-close")), "checkClass");

        return expect(mocks.compile.withArgs(checkClass)).to.have.been.calledOnce;
    });
});
