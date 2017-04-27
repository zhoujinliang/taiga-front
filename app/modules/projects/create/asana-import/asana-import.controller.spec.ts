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
 * File: asana-import.controller.spec.coffee
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

describe("AsanaImportCtrl", function() {
    let $provide = null;
    let $controller = null;
    const mocks: any = {};

    const _mockCurrentUserService = function() {
        mocks.currentUserService = {
            canAddMembersPrivateProject: sinon.stub(),
            canAddMembersPublicProject: sinon.stub(),
        };

        return $provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    const _mockAsanaImportService = function() {
        mocks.asanaService = {
            fetchProjects: sinon.stub(),
            fetchUsers: sinon.stub(),
            importProject: sinon.stub(),
        };

        return $provide.value("tgAsanaImportService", mocks.asanaService);
    };

    const _mockImportProjectService = function() {
        mocks.importProjectService = {
            importPromise: sinon.stub(),
        };

        return $provide.value("tgImportProjectService", mocks.importProjectService);
    };

    const _mockConfirm = function() {
        mocks.confirm = {
            loader: sinon.stub(),
        };

        return $provide.value("$tgConfirm", mocks.confirm);
    };

    const _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub(),
        };

        return $provide.value("$translate", mocks.translate);
    };

    const _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockAsanaImportService();
            _mockConfirm();
            _mockTranslate();
            _mockImportProjectService();
            _mockCurrentUserService();

            return null;
        })
    ;

    const _inject = () =>
        inject((_$controller_) => $controller = _$controller_)
    ;

    const _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("start project selector", function() {
        const ctrl = $controller("AsanaImportCtrl");
        ctrl.startProjectSelector();

        expect(ctrl.step).to.be.equal("project-select-asana");
        return expect(mocks.asanaService.fetchProjects).have.been.called;
    });

    it("on select project reload projects", function(done) {
        const project = Immutable.fromJS({
            id: 1,
            name: "project-name",
        });

        mocks.asanaService.fetchUsers.promise().resolve();

        const ctrl = $controller("AsanaImportCtrl");

        const promise = ctrl.onSelectProject(project);

        expect(ctrl.fetchingUsers).to.be.true;

        return promise.then(function() {
            expect(ctrl.fetchingUsers).to.be.false;
            expect(ctrl.step).to.be.equal("project-form-asana");
            expect(ctrl.project).to.be.equal(project);
            return done();
        });
    });

    it("on save project details reload users", function() {
        const project = Immutable.fromJS({
            id: 1,
            name: "project-name",
        });

        const ctrl = $controller("AsanaImportCtrl");
        ctrl.onSaveProjectDetails(project);

        expect(ctrl.step).to.be.equal("project-members-asana");
        return expect(ctrl.project).to.be.equal(project);
    });

    return it("on select user init import", function(done) {
        const users = Immutable.fromJS([
            {
                id: 0,
            },
            {
                id: 1,
            },
            {
                id: 2,
            },
        ]);

        const loaderObj = {
            start: sinon.spy(),
            update: sinon.stub(),
            stop: sinon.spy(),
        };

        const projectResult = {
            id: 3,
            name: "name",
        };

        mocks.confirm.loader.returns(loaderObj);

        mocks.importProjectService.importPromise.promise().resolve();

        const ctrl = $controller("AsanaImportCtrl");
        ctrl.project = Immutable.fromJS({
            id: 1,
            name: "project-name",
            description: "project-description",
            keepExternalReference: false,
            is_private: true,
        });

        mocks.asanaService.importProject.promise().resolve(projectResult);

        return ctrl.startImport(users).then(function() {
            expect(loaderObj.start).have.been.called;
            expect(loaderObj.stop).have.been.called;
            expect(mocks.asanaService.importProject).have.been.calledWith("project-name", "project-description", 1, users, false, true);

            return done();
        });
    });
});
