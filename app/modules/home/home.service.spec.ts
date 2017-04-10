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
 * File: home.service.spec.coffee
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

describe("tgHome", function() {
    let provide;
    let homeService = (provide = null);
    let mocks:any = {};

    let _mockResources = function() {
        mocks.resources = {};

        mocks.resources.epics = {};
        mocks.resources.userstories = {};
        mocks.resources.tasks = {};
        mocks.resources.issues = {};

        mocks.resources.epics.listInAllProjects = sinon.stub();
        mocks.resources.userstories.listInAllProjects = sinon.stub();
        mocks.resources.tasks.listInAllProjects = sinon.stub();
        mocks.resources.issues.listInAllProjects = sinon.stub();

        return provide.value("tgResources", mocks.resources);
    };

    let _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub()
        };

        return provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    let _mockProjectsService = function() {
        mocks.projectsService = {
            getProjectsByUserId: (<any>sinon.stub()).promise()
        };

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    let _inject = (callback=null) =>
        inject(function(_tgHomeService_) {
            homeService = _tgHomeService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockResources();
            _mockTgNavUrls();
            _mockProjectsService();

            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaHome");
        _setup();
        return _inject();
    });

    return it("get work in progress by user", function(done) {
        let userId = 3;

        let project1 = {id: 1, name: "fake1", slug: "project-1"};
        let project2 = {id: 2, name: "fake2", slug: "project-2"};

        mocks.projectsService.getProjectsByUserId
            .withArgs(userId)
            .resolve(Immutable.fromJS([
                project1,
                project2
            ]));

        mocks.resources.epics.listInAllProjects
            .withArgs(sinon.match({
                status__is_closed: false,
                assigned_to: userId
            }))
            .promise()
            .resolve(Immutable.fromJS([{id: 4, ref: 4, project: "1"}]));

        mocks.resources.epics.listInAllProjects
            .withArgs(sinon.match({
                status__is_closed: false,
                watchers: userId
            }))
            .promise()
            .resolve(Immutable.fromJS([
                {id: 4, ref: 4, project: "1"},
                {id: 5, ref: 5, project: "10"} // the user is not member of this project
            ]));

        mocks.resources.userstories.listInAllProjects
            .withArgs(sinon.match({
                is_closed: false,
                assigned_to: userId
            }))
            .promise()
            .resolve(Immutable.fromJS([{id: 1, ref: 1, project: "1"}]));

        mocks.resources.userstories.listInAllProjects
            .withArgs(sinon.match({
                is_closed: false,
                watchers: userId
            }))
            .promise()
            .resolve(Immutable.fromJS([
                {id: 1, ref: 1, project: "1"},
                {id: 2, ref: 2, project: "10"} // the user is not member of this project
            ]));

        mocks.resources.tasks.listInAllProjects.promise()
            .resolve(Immutable.fromJS([{id: 2, ref: 2, project: "1"}]));

        mocks.resources.issues.listInAllProjects.promise()
            .resolve(Immutable.fromJS([{id: 3, ref: 3, project: "1"}]));

        // mock urls
        mocks.tgNavUrls.resolve
            .withArgs("project-epics-detail", {project: "project-1", ref: 4})
            .returns("/testing-project/epic/1");

        mocks.tgNavUrls.resolve
            .withArgs("project-userstories-detail", {project: "project-1", ref: 1})
            .returns("/testing-project/us/1");

        mocks.tgNavUrls.resolve
            .withArgs("project-tasks-detail", {project: "project-1", ref: 2})
            .returns("/testing-project/tasks/1");

        mocks.tgNavUrls.resolve
            .withArgs("project-issues-detail", {project: "project-1", ref: 3})
            .returns("/testing-project/issues/1");

        return homeService.getWorkInProgress(userId)
            .then(function(workInProgress) {
                expect(workInProgress.toJS()).to.be.eql({
                    assignedTo: {
                        epics: [{
                            id: 4,
                            ref: 4,
                            url: '/testing-project/epic/1',
                            project: project1,
                            _name: 'epics'
                        }],
                        userStories: [{
                            id: 1,
                            ref: 1,
                            url: '/testing-project/us/1',
                            project: project1,
                            _name: 'userstories'
                        }],
                        tasks: [{
                            id: 2,
                            ref: 2,
                            project: project1,
                            url: '/testing-project/tasks/1',
                            _name: 'tasks'
                        }],
                        issues: [{
                            id: 3,
                            ref: 3,
                            url: '/testing-project/issues/1',
                            project: project1,
                            _name: 'issues'
                        }]
                    },
                    watching: {
                        epics: [{
                            id: 4,
                            ref: 4,
                            url: '/testing-project/epic/1',
                            project: project1,
                            _name: 'epics'
                        }],
                        userStories: [{
                            id: 1,
                            ref: 1,
                            url: '/testing-project/us/1',
                            project: project1,
                            _name: 'userstories'
                        }],
                        tasks: [{
                            id: 2,
                            ref: 2,
                            url: '/testing-project/tasks/1',
                            project: project1,
                            _name: 'tasks'
                        }],
                        issues: [{
                            id: 3,
                            ref: 3,
                            url: '/testing-project/issues/1',
                            project: project1,
                            _name: 'issues'
                        }]
                    }
                });

                return done();
        });
    });
});
