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
 * File: watch-project-button.service.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var sinon:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as _ from "lodash"

describe("tgWatchProjectButtonService", function() {
    let watchButtonService = null;
    let provide = null;
    let mocks:any = {};

    let _mockTgResources = function() {
        mocks.tgResources = {
            projects: {
                watchProject: sinon.stub(),
                unwatchProject: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    let _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            setProjects: sinon.stub(),
            getUser() {
                return Immutable.fromJS({
                    id: 89
                });
            },
            projects: Immutable.fromJS({
                all: [
                    {
                        id: 4,
                        total_watchers: 0,
                        is_watcher: false,
                        notify_level: null
                    },
                    {
                        id: 5,
                        total_watchers: 1,
                        is_watcher: true,
                        notify_level: 3
                    },
                    {
                        id: 6,
                        total_watchers: 0,
                        is_watcher: true,
                        notify_level: null
                    }
                ]
            })
        };

        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            setProject: sinon.stub()
        };

        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _inject = (callback=null) =>
        inject(function(_tgWatchProjectButtonService_) {
            watchButtonService = _tgWatchProjectButtonService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgResources();
            _mockTgCurrentUserService();
            _mockTgProjectService();
            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaProjects");
        _setup();
        return _inject();
    });

    it("watch", function(done) {
        let projectId = 4;
        let notifyLevel = 3;

        mocks.tgResources.projects.watchProject.withArgs(projectId, notifyLevel).promise().resolve();

        let newProject = {
            id: 4,
            total_watchers: 1,
            is_watcher: true,
            notify_level: notifyLevel
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(['all', 0]);

        let userServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable[0], newProject);
        }), 'userServiceCheckImmutable');

        let projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), 'projectServiceCheckImmutable');


        return watchButtonService.watch(projectId, notifyLevel).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.have.been.calledWith(userServiceCheckImmutable);
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });

    it("watch, if the user doesn't have the projects", function(done) {
        let projectId = 4;
        let notifyLevel = 3;

        mocks.tgResources.projects.watchProject.withArgs(projectId, notifyLevel).promise().resolve();

        let newProject = {
            id: 4,
            total_watchers: 1,
            is_watcher: true,
            notify_level: notifyLevel
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(['all', 0]);
        mocks.tgCurrentUserService.projects = Immutable.fromJS({
            all: []
        });

        let projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), 'projectServiceCheckImmutable');


        return watchButtonService.watch(projectId, notifyLevel).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.not.have.been.called;
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });

    it("watch another option", function(done) {
        let projectId = 5;
        let notifyLevel = 3;

        mocks.tgResources.projects.watchProject.withArgs(projectId, notifyLevel).promise().resolve();

        let newProject = {
            id: 5,
            total_watchers: 1,
            is_watcher: true,
            notify_level: notifyLevel
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(['all', 1]);

        let userServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable[1], newProject);
        }), 'userServiceCheckImmutable');

        let projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), 'projectServiceCheckImmutable');


        return watchButtonService.watch(projectId, notifyLevel).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.have.been.calledWith(userServiceCheckImmutable);
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });

    return it("unwatch", function(done) {
        let projectId = 5;

        mocks.tgResources.projects.unwatchProject.withArgs(projectId).promise().resolve();

        let newProject = {
            id: 5,
            total_watchers: 0,
            is_watcher: false,
            notify_level: null
        };

        mocks.tgProjectService.project =  mocks.tgCurrentUserService.projects.getIn(['all', 1]);

        let userServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable[1], newProject);
        }), 'userServiceCheckImmutable');

        let projectServiceCheckImmutable = sinon.match((function(immutable) {
            immutable = immutable.toJS();

            return _.isEqual(immutable, newProject);
        }), 'projectServiceCheckImmutable');


        return watchButtonService.unwatch(projectId).finally(function() {
            expect(mocks.tgCurrentUserService.setProjects).to.have.been.calledWith(userServiceCheckImmutable);
            expect(mocks.tgProjectService.setProject).to.have.been.calledWith(projectServiceCheckImmutable);

            return done();
        });
    });
});
