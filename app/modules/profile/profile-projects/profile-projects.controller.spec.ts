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
 * File: profile-projects.controller.spec.coffee
 */

describe("ProfileProjects", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    let mocks = {};

    let _mockUserService = function() {
        mocks.userService = {
            attachUserContactsToProjects: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userService);
    };

    let _mockProjectsService = function() {
        mocks.projectsService = {
            getProjectsByUserId: sinon.stub()
        };

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    let _mockAuthService = function() {
        let stub = sinon.stub();

        stub.returns({id: 2});

        return provide.value("$tgAuth", {
            getUser: stub
        });
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();
            _mockAuthService();
            _mockProjectsService();

            return null;
        })
    ;

    let _inject = callback =>
        inject(function(_$controller_,  _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProfile");
        _mocks();
        return _inject();
    });

    return it("load projects with contacts attached", function(done) {
        let user = Immutable.fromJS({id: 2});
        let projects = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        let projectsWithContacts = [
            {id: 1, contacts: "fake"},
            {id: 2, contacts: "fake"},
            {id: 3, contacts: "fake"}
        ];

        mocks.projectsService.getProjectsByUserId.withArgs(user.get("id")).promise().resolve(projects);
        mocks.userService.attachUserContactsToProjects.withArgs(user.get("id"), projects).returns(projectsWithContacts);

        let $scope = $rootScope.$new();

        let ctrl = $controller("ProfileProjects", $scope, {
            user
        });

        return ctrl.loadProjects().then(function() {
            expect(ctrl.projects).to.be.equal(projectsWithContacts);
            return done();
        });
    });
});
