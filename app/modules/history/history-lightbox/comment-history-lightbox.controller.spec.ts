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
 * File: subscriptions.controller.spec.coffee
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

describe("LightboxDisplayHistoricController", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgResources = function() {
        mocks.tgResources = {
            history: {
                getCommentHistory: sinon.stub()
            }
        };

        return provide.value("$tgResources", mocks.tgResources);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgResources();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaHistory");
        _mocks();

        return inject($controller => controller = $controller);
    });

    return it("load historic", function(done) {
        let historicLbCtrl = controller("LightboxDisplayHistoricCtrl");

        historicLbCtrl.name = "type";
        historicLbCtrl.object = 1;
        historicLbCtrl.comment = {};
        historicLbCtrl.comment.id = 1;

        let type = historicLbCtrl.name;
        let objectId = historicLbCtrl.object;
        let activityId = historicLbCtrl.comment.id;

        let promise = mocks.tgResources.history.getCommentHistory.withArgs(type, objectId, activityId).promise().resolve();

        return historicLbCtrl._loadHistoric().then(function(data) {
            expect(historicLbCtrl.commentHistoryEntries).is.equal(data);
            return done();
        });
    });
});
