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
 * File: like-project-button.service.spec.coffee
 */

declare var describe: any;
declare var angular: any;
const module = angular.mock.module;
declare var inject: any;
declare var it: any;
declare var sinon: any;
declare var expect: any;
declare var beforeEach: any;
import * as Immutable from "immutable";
import * as _ from "lodash";

describe("tgLikeProjectButtonService", function() {
    let likeButtonService = null;
    let provide = null;
    const mocks: any = {};

    const _mockTgResources = function() {
        mocks.tgResources = {
            projects: {
                likeProject: sinon.stub(),
                unlikeProject: sinon.stub(),
            },
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    const _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            setProjects: sinon.stub(),
            projects: Immutable.fromJS({
                all: [
                    {
                        id: 4,
                        total_fans: 2,
                        is_fan: false,
                    },
                    {
                        id: 5,
                        total_fans: 7,
                        is_fan: true,
                    },
                    {
                        id: 6,
                        total_fans: 4,
                        is_fan: true,
                    },
                ],
            }),
        };

        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    const _mockTgProjectService = function() {
        mocks.tgProjectService = {
            setProject: sinon.stub(),
        };

        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    const _inject = (callback= null) =>
        inject(function(_tgLikeProjectButtonService_) {
            likeButtonService = _tgLikeProjectButtonService_;
            if (callback) { return callback(); }
        })
    ;

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgResources();
            _mockTgCurrentUserService();
            _mockTgProjectService();
            return null;
        })
    ;

    const _setup = () => _mocks();

    beforeEach(function() {
        module("taigaProjects");
        _setup();
        return _inject();
    });

    it("like", function(done) {
        const projectId = 4;

        mocks.tgResources.projects.likeProject.withArgs(projectId).promise().resolve();

        const newProject = {
            id: 4,
            total_fans: 3,
            is_fan: true,
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(["all", 0]);

        const userServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable[0], newProject);
        }), "userServiceCheckImmutable");

        const projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), "projectServiceCheckImmutable");

        return likeButtonService.like(projectId).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.have.been.calledWith(userServiceCheckImmutable);
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });

    it("like, if the user doesn't have the project", function(done) {
        const projectId = 4;

        mocks.tgResources.projects.likeProject.withArgs(projectId).promise().resolve();

        const newProject = {
            id: 4,
            total_fans: 3,
            is_fan: true,
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(["all", 0]);

        mocks.tgCurrentUserService.projects = Immutable.fromJS({
            all: [],
        });

        const projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), "projectServiceCheckImmutable");

        return likeButtonService.like(projectId).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.not.have.been.called;
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });

    return it("unlike", function(done) {
        const projectId = 5;

        mocks.tgResources.projects.unlikeProject.withArgs(projectId).promise().resolve();

        const newProject =  {
            id: 5,
            total_fans: 6,
            is_fan: false,
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(["all", 1]);

        const userServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable[1], newProject);
        }), "userServiceCheckImmutable");

        const projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), "projectServiceCheckImmutable");

        return likeButtonService.unlike(projectId).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.have.been.calledWith(userServiceCheckImmutable);
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });
});
