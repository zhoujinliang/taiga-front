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
 * File: project.controller.spec.coffee
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

describe("ProjectController", function() {
    let $controller = null;
    let $q = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let _mockProjectService = function() {
        mocks.projectService = {};

        return provide.value("tgProjectService", mocks.projectService);
    };

    let _mockAppMetaService = function() {
        mocks.appMetaService = {
            setfn: sinon.stub()
        };

        return provide.value("tgAppMetaService", mocks.appMetaService);
    };

    let _mockAuth = function() {
        mocks.auth = {
            userData: Immutable.fromJS({username: "UserName"})
        };

        return provide.value("$tgAuth", mocks.auth);
    };

    let _mockRouteParams = () =>
        provide.value("$routeParams", {
            pslug: "project-slug"
        })
    ;

    let _mockTranslate = function() {
        mocks.translate = {};
        mocks.translate.instant = sinon.stub();

        return provide.value("$translate", mocks.translate);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockProjectService();
            _mockRouteParams();
            _mockAppMetaService();
            _mockAuth();
            _mockTranslate();
            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$q_, _$rootScope_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");
        _mocks();
        return _inject();
    });

    it("set local user", function() {
        let project = Immutable.fromJS({
            name: "projectName",
            members: []
        });

        let ctrl = $controller("Project",
            {$scope: {}});

        return expect(ctrl.user).to.be.equal(mocks.auth.userData);
    });

    it("set page title", function() {
        let $scope = $rootScope.$new();
        let project = Immutable.fromJS({
            name: "projectName",
            description: "projectDescription",
            members: []
        });

        mocks.translate.instant
            .withArgs('PROJECT.PAGE_TITLE', {
                projectName: project.get("name")
            })
            .returns('projectTitle');

        mocks.projectService.project = project;

        let ctrl = $controller("Project");

        let metas = ctrl._setMeta(project);

        expect(metas.title).to.be.equal('projectTitle');
        expect(metas.description).to.be.equal('projectDescription');
        return expect(mocks.appMetaService.setfn).to.be.calledOnce;
    });

    return it("set local project variable and members", function() {
        let project = Immutable.fromJS({
            name: "projectName"
        });

        let members = Immutable.fromJS([
            {is_active: true},
            {is_active: true},
            {is_active: true}
        ]);

        mocks.projectService.project = project;
        mocks.projectService.activeMembers = members;

        let ctrl = $controller("Project");

        expect(ctrl.project).to.be.equal(project);
        return expect(ctrl.members).to.be.equal(members);
    });
});
