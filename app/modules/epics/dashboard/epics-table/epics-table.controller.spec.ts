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
 * File: epic-row.controller.spec.coffee
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

describe("EpicTable", function() {
    let epicTableCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };
        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgEpicsService = function() {
        mocks.tgEpicsService = {
            createEpic: sinon.stub(),
            nextPage: sinon.stub()
        };
        return provide.value("tgEpicsService", mocks.tgEpicsService);
    };

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            project: Immutable.fromJS({
                'id': 3
            })
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mockTgStorageService = function() {
        mocks.tgStorage = {
            get: sinon.stub(),
            set: sinon.spy()
        };

        mocks.tgStorage.get.returns({col1: true});
        return provide.value("$tgStorage", mocks.tgStorage);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgConfirm();
            _mockTgEpicsService();
            _mockTgStorageService();
            _mockTgProjectService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("toggle table options", function() {
        epicTableCtrl = controller("EpicsTableCtrl");
        epicTableCtrl.displayOptions = true;
        epicTableCtrl.toggleEpicTableOptions();
        return expect(epicTableCtrl.displayOptions).to.be.false;
    });

    it("next page", function() {
        epicTableCtrl = controller("EpicsTableCtrl");

        epicTableCtrl.nextPage();

        return expect(mocks.tgEpicsService.nextPage).to.have.been.calledOnce;
    });

    return it("storage view options", function() {
        epicTableCtrl = controller("EpicsTableCtrl");

        return expect(epicTableCtrl.column).to.be.eql({col1: true});
    });
});
