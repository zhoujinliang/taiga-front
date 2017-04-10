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
 * File: jira-import.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("JiraImportCtrl", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            canAddMembersPrivateProject: sinon.stub(),
            canAddMembersPublicProject: sinon.stub()
        };

        return $provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockJiraImportService = function() {
        mocks.jiraService = {
            fetchProjects: sinon.stub(),
            fetchUsers: sinon.stub(),
            importProject: sinon.stub()
        };

        return $provide.value("tgJiraImportService", mocks.jiraService);
    };

    let _mockImportProjectService = function() {
        mocks.importProjectService = {
            importPromise: sinon.stub()
        };

        return $provide.value("tgImportProjectService", mocks.importProjectService);
    };

    let _mockConfirm = function() {
        mocks.confirm = {
            loader: sinon.stub()
        };

        return $provide.value("$tgConfirm", mocks.confirm);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return $provide.value("$translate", mocks.translate);
    };
    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockJiraImportService();
            _mockConfirm();
            _mockTranslate();
            _mockImportProjectService();
            _mockCurrentUserService();

            return null;
        })
    ;

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("start project selector", function() {
        let ctrl = $controller("JiraImportCtrl");
        ctrl.startProjectSelector();

        expect(ctrl.step).to.be.equal('project-select-jira');
        return expect(mocks.jiraService.fetchProjects).have.been.called;
    });

    it("on select project reload projects", function(done) {
        let project = Immutable.fromJS({
            id: 1,
            name: "project-name"
        });

        mocks.jiraService.fetchUsers.promise().resolve();

        let ctrl = $controller("JiraImportCtrl");

        let promise = ctrl.onSelectProject(project);

        expect(ctrl.fetchingUsers).to.be.true;

        return promise.then(function() {
            expect(ctrl.fetchingUsers).to.be.false;
            expect(ctrl.step).to.be.equal('project-form-jira');
            expect(ctrl.project).to.be.equal(project);
            return done();
        });
    });

    it("on save project details reload users", function() {
        let project = Immutable.fromJS({
            id: 1,
            name: "project-name"
        });

        let ctrl = $controller("JiraImportCtrl");
        ctrl.onSaveProjectDetails(project);

        expect(ctrl.step).to.be.equal('project-members-jira');
        return expect(ctrl.project).to.be.equal(project);
    });

    return it("on select user init import", function(done) {
        let users = Immutable.fromJS([
            {
                id: 0
            },
            {
                id: 1
            },
            {
                id: 2
            }
        ]);

        let loaderObj = {
            start: sinon.spy(),
            update: sinon.stub(),
            stop: sinon.spy()
        };

        let projectResult = {
            id: 3,
            name: "name"
        };

        mocks.confirm.loader.returns(loaderObj);

        mocks.importProjectService.importPromise.promise().resolve();

        let ctrl = $controller("JiraImportCtrl");
        ctrl.project = Immutable.fromJS({
            id: 1,
            name: 'project-name',
            description: 'project-description',
            keepExternalReference: false,
            is_private: true
        });


        mocks.jiraService.importProject.promise().resolve(projectResult);

        return ctrl.startImport(users).then(function() {
            expect(loaderObj.start).have.been.called;
            expect(loaderObj.stop).have.been.called;
            expect(mocks.jiraService.importProject).have.been.calledWith('project-name', 'project-description', 1, users, false, true);

            return done();
        });
    });
});
