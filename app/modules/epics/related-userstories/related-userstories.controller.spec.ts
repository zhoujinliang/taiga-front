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
 * File: related-userstories.controller.spec.coffee
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

describe("RelatedUserStories", function() {
    let RelatedUserStoriesCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgEpicsService = function() {
        mocks.tgEpicsService = {
            listRelatedUserStories: sinon.stub(),
            reorderRelatedUserstory: sinon.stub()
        };

        return provide.value("tgEpicsService", mocks.tgEpicsService);
    };

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            hasPermission: sinon.stub()
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgEpicsService();
            _mockTgProjectService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("load related userstories", function(done) {
        let ctrl = controller("RelatedUserStoriesCtrl");
        let userstories = Immutable.fromJS([
            {
                id: 1
            }
        ]);

        ctrl.epic = Immutable.fromJS({
            id: 66
        });

        let promise = mocks.tgEpicsService.listRelatedUserStories
            .withArgs(ctrl.epic)
            .promise()
            .resolve(userstories);

        return ctrl.loadRelatedUserstories().then(function() {
            expect(ctrl.userstories).is.equal(userstories);
            return done();
        });
    });

    return it("reorderRelatedUserstory", function(done) {
        let ctrl = controller("RelatedUserStoriesCtrl");
        let userstories = Immutable.fromJS([
            {
                id: 1
            },
            {
                id: 2
            }
        ]);

        let reorderedUserstories = Immutable.fromJS([
            {
                id: 2
            },
            {
                id: 1
            }
        ]);

        ctrl.epic = Immutable.fromJS({
            id: 66
        });

        let promise = mocks.tgEpicsService.reorderRelatedUserstory
            .withArgs(ctrl.epic, ctrl.userstories, userstories.get(1), 0)
            .promise()
            .resolve(reorderedUserstories);

        return ctrl.reorderRelatedUserstory(userstories.get(1), 0).then(function() {
            expect(ctrl.userstories).is.equal(reorderedUserstories);
            return done();
        });
    });
});
