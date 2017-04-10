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
 * File: projects.service.spec.coffee
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

describe("tgProjectsService", function() {
    let $rootScope, provide;
    let projectsService = (provide = ($rootScope = null));
    let $q = null;
    let mocks:any = {};

    let _mockResources = function() {
        mocks.resources = {};

        mocks.resources.projects = {};

        mocks.resources.projects.getProjectsByUserId = () =>
            $q(resolve => resolve(Immutable.fromJS([])))
        ;

        return provide.value("tgResources", mocks.resources);
    };

    let _mockAuthService = function() {
        mocks.auth = {userData: Immutable.fromJS({id: 10})};

        return provide.value("$tgAuth", mocks.auth);
    };

    let _mockProjectUrl = function() {
        mocks.projectUrl = {get: sinon.stub()};

        mocks.projectUrl.get = project => `url-${project.id}`;

        return provide.value("$projectUrl", mocks.projectUrl);
    };


    let _inject = (callback=null) =>
        inject(function(_$q_, _$rootScope_, _tgProjectsService_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            projectsService = _tgProjectsService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockResources();
            _mockProjectUrl();
            _mockAuthService();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");
        _mocks();
        return _inject();
    });

    it("bulkUpdateProjectsOrder and then fetch projects again", function() {
        let projects_order = [
            {"id": 8},
            {"id": 2},
            {"id": 3},
            {"id": 9},
            {"id": 1},
            {"id": 4},
            {"id": 10},
            {"id": 5},
            {"id": 6},
            {"id": 7},
            {"id": 11},
            {"id": 12},
        ];

        mocks.resources.projects = {};
        mocks.resources.projects.bulkUpdateOrder = sinon.stub();
        mocks.resources.projects.bulkUpdateOrder.withArgs(projects_order).returns(true);

        let result = projectsService.bulkUpdateProjectsOrder(projects_order);

        return expect(result).to.be.true;
    });

    it("getProjectStats", function() {
        let projectId = 3;

        mocks.resources.projects = {};
        mocks.resources.projects.getProjectStats = sinon.stub();
        mocks.resources.projects.getProjectStats.withArgs(projectId).returns(true);

        return expect(projectsService.getProjectStats(projectId)).to.be.true;
    });

    it("getProjectBySlug", function(done) {
        let projectSlug = "project-slug";
        let project = Immutable.fromJS({id: 2, url: 'url-2', tags: ['xx', 'yy', 'aa'], tags_colors: {xx: "red", yy: "blue", aa: "white"}});

        mocks.resources.projects = {};
        mocks.resources.projects.getProjectBySlug = sinon.stub();
        mocks.resources.projects.getProjectBySlug.withArgs(projectSlug).promise().resolve(project);

        return projectsService.getProjectBySlug(projectSlug).then(function(project) {
            expect(project.toJS()).to.be.eql(
                {
                    id: 2,
                    url: 'url-2',
                    tags: ['xx', 'yy', 'aa'],
                    tags_colors: {xx: "red", yy: "blue", aa: "white"}
                }
            );

            return done();
        });
    });

    it("getProjectsByUserId", function(done) {
        let projectId = 3;

        let projects = Immutable.fromJS([
            {id: 1, url: 'url-1'},
            {id: 2, url: 'url-2', tags: ['xx', 'yy', 'aa'], tags_colors: {xx: "red", yy: "blue", aa: "white"}}
        ]);

        mocks.resources.projects = {};
        mocks.resources.projects.getProjectsByUserId = sinon.stub();
        mocks.resources.projects.getProjectsByUserId.withArgs(projectId).promise().resolve(projects);

        return projectsService.getProjectsByUserId(projectId).then(function(projects) {
            expect(projects.toJS()).to.be.eql([{
                    id: 1,
                    url: 'url-1'
                },
                {
                    id: 2,
                    url: 'url-2',
                    tags: ['xx', 'yy', 'aa'],
                    tags_colors: {xx: "red", yy: "blue", aa: "white"}
                }
            ]);

            return done();
        });
    });

    return it("validateTransferToken", function(done) {
        let projectId = 3;

        let tokenValidation = Immutable.fromJS({});

        mocks.resources.projects = {};
        mocks.resources.projects.transferValidateToken = sinon.stub();
        mocks.resources.projects.transferValidateToken.withArgs(projectId).promise().resolve(tokenValidation);

        return projectsService.transferValidateToken(projectId).then(function(projects) {
            expect(projects.toJS()).to.be.eql({});
            return done();
        });
    });
});
