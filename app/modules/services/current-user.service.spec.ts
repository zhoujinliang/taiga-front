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
 * File: current-user.service.spec.coffee
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

describe("tgCurrentUserService", function() {
    let provide;
    let currentUserService = (provide = null);
    const mocks: any = {};

    const _mockTgStorage = function() {
        mocks.storageService = {
            get: sinon.stub(),
        };

        return provide.value("$tgStorage", mocks.storageService);
    };

    const _mockProjectsService = function() {
        mocks.projectsService = {
            getProjectsByUserId: sinon.stub(),
            bulkUpdateProjectsOrder: sinon.stub(),
        };

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    const _mockResources = function() {
        mocks.resources = {
            user: {
                setUserStorage: sinon.stub(),
                getUserStorage: sinon.stub(),
                createUserStorage: sinon.stub(),
            },
        };

        return provide.value("tgResources", mocks.resources);
    };

    const _inject = (callback= null) =>
        inject(function(_tgCurrentUserService_) {
            currentUserService = _tgCurrentUserService_;
            if (callback) { return callback(); }
        })
    ;

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgStorage();
            _mockProjectsService();
            _mockResources();

            return null;
        })
    ;

    const _setup = () => _mocks();

    beforeEach(function() {
        module("taigaCommon");
        _setup();
        return _inject();
    });

    describe("get user", function() {
        it("return the user if it is defined", function() {
            currentUserService._user = 123;

            return expect(currentUserService.getUser()).to.be.equal(123);
        });

        return it("get user form storage if it is not defined", function() {
            const user = {id: 1, name: "fake1"};

            currentUserService.setUser = sinon.spy();
            mocks.storageService.get.withArgs("userInfo").returns(user);

            const _user = currentUserService.getUser();

            return expect(currentUserService.setUser).to.be.calledOnce;
        });
    });

    it("set user and load user info", function(done) {
        const user = Immutable.fromJS({id: 1, name: "fake1"});

        const projects = Immutable.fromJS([
            {id: 1, name: "fake1"},
            {id: 2, name: "fake2"},
            {id: 3, name: "fake3"},
            {id: 4, name: "fake4"},
            {id: 5, name: "fake5"},
        ]);

        mocks.projectsService.getProjectsByUserId = sinon.stub();
        mocks.projectsService.getProjectsByUserId.withArgs(user.get("id")).promise().resolve(projects);

        return currentUserService.setUser(user).then(function() {
            expect(currentUserService._user).to.be.equal(user);
            expect(currentUserService.projects.get("all").size).to.be.equal(5);
            expect(currentUserService.projects.get("recents").size).to.be.equal(5);
            expect(currentUserService.projectsById.size).to.be.equal(5);
            expect(currentUserService.projectsById.get("3").get("name")).to.be.equal("fake3");

            return done();
        });
    });

    it("bulkUpdateProjectsOrder and reload projects", function(done) {
        const fakeData = [{id: 2}];

        currentUserService.loadProjects = sinon.stub();

        mocks.projectsService.bulkUpdateProjectsOrder.withArgs(fakeData).promise().resolve();

        return currentUserService.bulkUpdateProjectsOrder(fakeData).then(function() {
            expect(currentUserService.loadProjects).to.be.callOnce;

            return done();
        });
    });

    it("loadProject and set it", function(done) {
        const user = Immutable.fromJS({id: 1, name: "fake1"});
        const project = Immutable.fromJS({id: 2, name: "fake2"});

        currentUserService._user = user;
        currentUserService.setProjects = sinon.stub();

        mocks.projectsService.getProjectsByUserId.withArgs(1).promise().resolve(project);

        return currentUserService.loadProjects().then(function() {
            expect(currentUserService.setProjects).to.have.been.calledWith(project);

            return done();
        });
    });

    it("setProject", function() {
        const projectsRaw = [
            {id: 1, name: "fake1"},
            {id: 2, name: "fake2"},
            {id: 3, name: "fake3"},
            {id: 4, name: "fake4"},
        ];
        const projectsRawById = {
            [1]: {id: 1, name: "fake1"},
            [2]: {id: 2, name: "fake2"},
            [3]: {id: 3, name: "fake3"},
            [4]: {id: 4, name: "fake4"},
        };
        const projects = Immutable.fromJS(projectsRaw);

        currentUserService.setProjects(projects);

        expect(currentUserService.projects.get("all").toJS()).to.be.eql(projectsRaw);
        expect(currentUserService.projects.get("recents").toJS()).to.be.eql(projectsRaw);
        return expect(currentUserService.projectsById.toJS()).to.be.eql(projectsRawById);
    });

    it("is authenticated", function() {
        currentUserService.getUser = sinon.stub();
        currentUserService.getUser.returns({});

        expect(currentUserService.isAuthenticated()).to.be.true;

        currentUserService.getUser.returns(null);

        return expect(currentUserService.isAuthenticated()).to.be.false;
    });

    it("remove user", function() {
        currentUserService._user = true;

        currentUserService.removeUser();

        return expect(currentUserService._user).to.be.null;
    });

    it("disable joyride for anon user", function() {
        currentUserService.isAuthenticated = sinon.stub();
        currentUserService.isAuthenticated.returns(false);
        currentUserService.disableJoyRide();

        return expect(mocks.resources.user.setUserStorage).to.have.not.been.called;
    });

    it("disable joyride for logged user", function() {
        currentUserService.isAuthenticated = sinon.stub();
        currentUserService.isAuthenticated.returns(true);
        currentUserService.disableJoyRide();

        return expect(mocks.resources.user.setUserStorage).to.have.been.calledWith("joyride", {
            backlog: false,
            kanban: false,
            dashboard: false,
        });
    });

    it("load joyride config", function(done) {
        mocks.resources.user.getUserStorage.withArgs("joyride").promise().resolve(true);

        return currentUserService.loadJoyRideConfig().then(function(config) {
            expect(config).to.be.true;

            return done();
        });
    });

    it("create default joyride config", function(done) {
        mocks.resources.user.getUserStorage.withArgs("joyride").promise().reject(new Error("error"));

        return currentUserService.loadJoyRideConfig().then(function(config) {
            const joyride = {
                backlog: true,
                kanban: true,
                dashboard: true,
            };

            expect(mocks.resources.user.createUserStorage).to.have.been.calledWith("joyride", joyride);
            expect(config).to.be.eql(joyride);

            return done();
        });
    });

    it("the user can't create private projects if they reach the maximum number of private projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_private_projects: 1,
            total_private_projects: 1,
        });

        currentUserService._user = user;

        const result = currentUserService.canCreatePrivateProjects();

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_private_projects",
            type: "private_project",
            current: 1,
            max: 1,
        });
    });

    it("the user can create private projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_private_projects: 10,
            total_private_projects: 1,
            max_memberships_private_projects: 20,
        });

        currentUserService._user = user;

        const result = currentUserService.canCreatePrivateProjects(10);

        return expect(result).to.be.eql({
            valid: true,
        });
    });

    it("the user can't create public projects if they reach the maximum number of private projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_public_projects: 1,
            total_public_projects: 1,
        });

        currentUserService._user = user;

        const result = currentUserService.canCreatePublicProjects(0);

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_public_projects",
            type: "public_project",
            current: 1,
            max: 1,
        });
    });

    it("the user can create public projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_public_projects: 10,
            total_public_projects: 1,
            max_memberships_public_projects: 20,
        });

        currentUserService._user = user;

        const result = currentUserService.canCreatePublicProjects(10);

        return expect(result).to.be.eql({
            valid: true,
        });
    });

    it("the user can own public project", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_public_projects: 10,
            total_public_projects: 1,
            max_memberships_public_projects: 20,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: false,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: true,
        });
    });

    it("the user can't own public project because of max projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_public_projects: 1,
            total_public_projects: 1,
            max_memberships_public_projects: 20,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: false,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_public_projects",
            type: "public_project",
            current: 1,
            max: 1,
        });
    });

    it("the user can't own public project because of max memberships", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_public_projects: 5,
            total_public_projects: 1,
            max_memberships_public_projects: 4,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: false,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_members_public_projects",
            type: "public_project",
            current: 5,
            max: 4,
        });
    });

    it("the user can own private project", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_private_projects: 10,
            total_private_projects: 1,
            max_memberships_private_projects: 20,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: true,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: true,
        });
    });

    it("the user can't own private project because of max projects", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_private_projects: 1,
            total_private_projects: 1,
            max_memberships_private_projects: 20,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: true,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_private_projects",
            type: "private_project",
            current: 1,
            max: 1,
        });
    });

    return it("the user can't own private project because of max memberships", function() {
        const user = Immutable.fromJS({
            id: 1,
            name: "fake1",
            max_private_projects: 10,
            total_private_projects: 1,
            max_memberships_private_projects: 4,
        });

        currentUserService._user = user;

        const project = Immutable.fromJS({
                id: 2,
                name: "fake2",
                total_memberships: 5,
                is_private: true,
        });

        const result = currentUserService.canOwnProject(project);

        return expect(result).to.be.eql({
            valid: false,
            reason: "max_members_private_projects",
            type: "private_project",
            current: 5,
            max: 4,
        });
    });
});
