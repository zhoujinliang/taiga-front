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

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("tgAsanaImportService", function() {
    let $provide = null;
    let service = null;
    let mocks:any = {};

    let _mockResources = function() {
        mocks.resources = {
            asanaImporter: {
                listProjects: sinon.stub(),
                listUsers: sinon.stub(),
                importProject: sinon.stub(),
                getAuthUrl: sinon.stub(),
                authorize: sinon.stub()
            }
        };

        return $provide.value("tgResources", mocks.resources);
    };

    let _mockLocation = function() {
        mocks.location = {
            search: sinon.stub()
        };

        mocks.location.search.returns({
            from: 'asana',
            token: 123
        });

        return $provide.value("$location", mocks.location);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockResources();
            _mockLocation();

            return null;
        })
    ;

    let _inject = () =>
        inject(_tgAsanaImportService_ => service = _tgAsanaImportService_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("fetch projects", function(done) {
        service.setToken(123);
        mocks.resources.asanaImporter.listProjects.withArgs(123).promise().resolve('projects');

        return service.fetchProjects().then(function() {
            service.projects = "projects";
            return done();
        });
    });

    it("fetch user", function(done) {
        service.setToken(123);
        let projectId = 3;
        mocks.resources.asanaImporter.listUsers.withArgs(123, projectId).promise().resolve('users');

        return service.fetchUsers(projectId).then(function() {
            service.projectUsers = 'users';
            return done();
        });
    });

    it("import project", function() {
        service.setToken(123);
        let projectId = 2;

        service.importProject(projectId, true, true ,true);

        return expect(mocks.resources.asanaImporter.importProject).to.have.been.calledWith(123, projectId, true, true, true);
    });

    it("get auth url", function(done) {
        service.setToken(123);
        let projectId = 3;

        let response = {
            data: {
                url: "url123"
            }
        };

        mocks.resources.asanaImporter.getAuthUrl.promise().resolve(response);

        return service.getAuthUrl().then(function(url) {
            expect(url).to.be.equal("url123");
            return done();
        });
    });

    return it("authorize", function(done) {
        service.setToken(123);
        let projectId = 3;
        let verifyCode = 12345;

        let response = {
            data: {
                token: "token123"
            }
        };

        mocks.resources.asanaImporter.authorize.withArgs(verifyCode).promise().resolve(response);

        return service.authorize(verifyCode).then(function(token) {
            expect(token).to.be.equal("token123");
            return done();
        });
    });
});
