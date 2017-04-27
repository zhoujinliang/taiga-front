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
 * File: projects-listing.controller.spec.coffee
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

describe("ProjectsListingController", function() {
    let pageCtrl =  null;
    let provide = null;
    let controller = null;
    const mocks: any = {};

    const projects = Immutable.fromJS({
        all: [
            {id: 1},
            {id: 2},
            {id: 3},
        ],
    });

    const _mockCurrentUserService = function() {
        const stub = sinon.stub();

        mocks.currentUserService = {
            projects,
        };

        return provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    const _mockProjectsService = function() {
        const stub = sinon.stub();

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockCurrentUserService();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");

        _mocks();

        return inject(($controller) => controller = $controller);
    });

    return it("define projects", function() {
        pageCtrl = controller("ProjectsListing",
            {$scope: {}});

        return expect(pageCtrl.projects).to.be.equal(projects.get("all"));
    });
});
