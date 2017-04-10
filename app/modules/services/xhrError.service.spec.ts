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
 * File: xhrError.service.spec.coffee
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

describe("tgXhrErrorService", function() {
    let provide;
    let xhrErrorService = (provide = null);
    let mocks:any = {};

    let _mockQ = function() {
        mocks.q = {
            reject: sinon.spy()
        };

        return provide.value("$q", mocks.q);
    };


    let _mockErrorHandling = function() {
        mocks.errorHandling = {
            notfound: sinon.stub(),
            permissionDenied: sinon.stub()
        };

        return provide.value("tgErrorHandlingService", mocks.errorHandling);
    };

    let _inject = (callback=null) =>
        inject(function(_tgXhrErrorService_) {
            xhrErrorService = _tgXhrErrorService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockQ();
            _mockErrorHandling();

            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaCommon");
        _setup();
        return _inject();
    });

    it("404 status redirect to not-found page", function() {
        let xhr = {
            status: 404
        };

        xhrErrorService.response(xhr);

        expect(mocks.q.reject.withArgs(xhr)).to.be.calledOnce;
        return expect(mocks.errorHandling.notfound).to.be.calledOnce;
    });

    return it("403 status redirect to permission-denied page", function() {
        let xhr = {
            status: 403
        };

        xhrErrorService.response(xhr);

        expect(mocks.q.reject.withArgs(xhr)).to.be.calledOnce;
        return expect(mocks.errorHandling.permissionDenied).to.be.calledOnce;
    });
});
