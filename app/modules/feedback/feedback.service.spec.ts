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
 * File: feedback.service.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("tgFeedbackService", function() {
    let provide;
    let feedbackService = (provide = null);
    let mocks:any = {};

    let _mockTgLightboxFactory = function() {
        mocks.tgLightboxFactory = {
            create: sinon.stub()
        };

        return provide.value("tgLightboxFactory", mocks.tgLightboxFactory);
    };

    let _inject = (callback=null) =>
        inject(function(_tgFeedbackService_) {
            feedbackService = _tgFeedbackService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgLightboxFactory();
            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaFeedback");
        _setup();
        return _inject();
    });

    return it("work in progress filled", function() {
        expect(mocks.tgLightboxFactory.create.callCount).to.be.equal(0);
        feedbackService.sendFeedback();
        expect(mocks.tgLightboxFactory.create.callCount).to.be.equal(1);
        let params = {
            "class": "lightbox lightbox-feedback lightbox-generic-form"
        };
        return expect(mocks.tgLightboxFactory.create.calledWith("tg-lb-feedback", params)).to.be.true;
    });
});
