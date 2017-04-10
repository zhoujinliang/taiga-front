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
 * File: create-project-form.controller.spec.coffee
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

describe("CreateProjectFormCtrl", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockNavUrlsService = function() {
        mocks.navUrls = {
            resolve: sinon.stub()
        };

        return $provide.value("$tgNavUrls", mocks.navUrls);
    };

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            canCreatePublicProjects: sinon.stub().returns({valid: true}),
            canCreatePrivateProjects: sinon.stub().returns({valid: true})
        };

        return $provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockProjectsService = function() {
        mocks.projectsService = {
            create: sinon.stub()
        };

        return $provide.value("tgProjectsService", mocks.projectsService);
    };

    let _mockProjectUrl = function() {
        mocks.projectUrl = {
            get: sinon.stub()
        };

        return $provide.value("$projectUrl", mocks.projectUrl);
    };

    let _mockLocation = function() {
        mocks.location = {
            url: sinon.stub()
        };

        return $provide.value("$location", mocks.location);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockCurrentUserService();
            _mockProjectsService();
            _mockProjectUrl();
            _mockLocation();
            _mockNavUrlsService();

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

    it("submit project form", function() {
        let ctrl = $controller("CreateProjectFormCtrl");

        ctrl.projectForm = 'form';

        mocks.projectsService.create.withArgs('form').promise().resolve('project1');
        mocks.projectUrl.get.returns('project-url');

        return ctrl.submit().then(function() {
            expect(ctrl.formSubmitLoading).to.be.true;

            return expect(mocks.location.url).to.have.been.calledWith('project-url');
        });
    });

    it('check if the user can create a private projects', function() {
        mocks.currentUserService.canCreatePrivateProjects = sinon.stub().returns({valid: true});

        let ctrl = $controller("CreateProjectFormCtrl");

        ctrl.projectForm = {
            is_private: true
        };

        expect(ctrl.canCreateProject()).to.be.true;

        mocks.currentUserService.canCreatePrivateProjects = sinon.stub().returns({valid: false});

        ctrl = $controller("CreateProjectFormCtrl");

        ctrl.projectForm = {
            is_private: true
        };

        return expect(ctrl.canCreateProject()).to.be.false;
    });

    return it('check if the user can create a public projects', function() {
        mocks.currentUserService.canCreatePublicProjects = sinon.stub().returns({valid: true});

        let ctrl = $controller("CreateProjectFormCtrl");

        ctrl.projectForm = {
            is_private: false
        };

        expect(ctrl.canCreateProject()).to.be.true;

        mocks.currentUserService.canCreatePublicProjects = sinon.stub().returns({valid: false});

        ctrl = $controller("CreateProjectFormCtrl");

        ctrl.projectForm = {
            is_private: false
        };

        return expect(ctrl.canCreateProject()).to.be.false;
    });
});
