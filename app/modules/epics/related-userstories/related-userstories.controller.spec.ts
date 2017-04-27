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

declare var describe: any;
declare var angular: any;
const module = angular.mock.module;
declare var inject: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;
import * as Immutable from "immutable";
declare var sinon: any;

describe("RelatedUserStories", function() {
    const RelatedUserStoriesCtrl =  null;
    let provide = null;
    let controller = null;
    const mocks: any = {};

    const _mockTgEpicsService = function() {
        mocks.tgEpicsService = {
            listRelatedUserStories: sinon.stub(),
            reorderRelatedUserstory: sinon.stub(),
        };

        return provide.value("tgEpicsService", mocks.tgEpicsService);
    };

    const _mockTgProjectService = function() {
        mocks.tgProjectService = {
            hasPermission: sinon.stub(),
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    const _mocks = () =>
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

        return inject(($controller) => controller = $controller);
    });

    it("load related userstories", function(done) {
        const ctrl = controller("RelatedUserStoriesCtrl");
        const userstories = Immutable.fromJS([
            {
                id: 1,
            },
        ]);

        ctrl.epic = Immutable.fromJS({
            id: 66,
        });

        const promise = mocks.tgEpicsService.listRelatedUserStories
            .withArgs(ctrl.epic)
            .promise()
            .resolve(userstories);

        return ctrl.loadRelatedUserstories().then(function() {
            expect(ctrl.userstories).is.equal(userstories);
            return done();
        });
    });

    return it("reorderRelatedUserstory", function(done) {
        const ctrl = controller("RelatedUserStoriesCtrl");
        const userstories = Immutable.fromJS([
            {
                id: 1,
            },
            {
                id: 2,
            },
        ]);

        const reorderedUserstories = Immutable.fromJS([
            {
                id: 2,
            },
            {
                id: 1,
            },
        ]);

        ctrl.epic = Immutable.fromJS({
            id: 66,
        });

        const promise = mocks.tgEpicsService.reorderRelatedUserstory
            .withArgs(ctrl.epic, ctrl.userstories, userstories.get(1), 0)
            .promise()
            .resolve(reorderedUserstories);

        return ctrl.reorderRelatedUserstory(userstories.get(1), 0).then(function() {
            expect(ctrl.userstories).is.equal(reorderedUserstories);
            return done();
        });
    });
});
