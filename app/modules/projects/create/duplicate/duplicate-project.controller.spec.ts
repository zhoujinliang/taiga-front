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
 * File: home.controller.spec.coffee
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

describe("DuplicateProjectController", function() {
    let ctrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {};
        mocks.currentUserService.getUser = sinon.stub();
        mocks.currentUserService.canCreatePublicProjects = sinon.stub().returns(true);
        mocks.currentUserService.canCreatePrivateProjects = sinon.stub().returns(true);

        mocks.currentUserService.projects = {};
        mocks.currentUserService.projects.get = sinon.stub().returns([]);

        mocks.currentUserService.loadProjects = sinon.stub();

        mocks.currentUserService.canAddMembersPrivateProject = sinon.stub();
        mocks.currentUserService.canAddMembersPublicProject = sinon.stub();

        return provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockProjectService = function() {
        mocks.projectsService = {};
        mocks.projectsService.getProjectBySlug = sinon.stub();
        mocks.projectsService.duplicate = sinon.stub();

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    let _mockLocation = function() {
        mocks.location = {
            path: sinon.stub()
        };
        return provide.value("$tgLocation", mocks.location);
    };

    let _mockTgNav = function() {
        mocks.urlservice = {
            resolve: sinon.stub()
        };
        return provide.value("$tgNavUrls", mocks.urlservice);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockCurrentUserService();
            _mockProjectService();
            _mockLocation();
            _mockTgNav();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");

        _mocks();

        inject($controller => controller = $controller);

        ctrl = controller("DuplicateProjectCtrl");

        ctrl.projects = Immutable.fromJS([
            {
                id: 1
            },
            {
                id: 2
            }
        ]);

        ctrl.user = Immutable.fromJS([
            {
                id: 1
            }
        ]);

        ctrl.canCreatePublicProjects = mocks.currentUserService.canCreatePublicProjects();
        ctrl.canCreatePrivateProjects = mocks.currentUserService.canCreatePublicProjects();
        return ctrl.projectForm = {};});

    it("toggle invited Member", function() {
        ctrl = controller("DuplicateProjectCtrl");

        ctrl.invitedMembers = Immutable.List([1, 2, 3]);
        ctrl.checkUsersLimit = sinon.spy();

        ctrl.toggleInvitedMember(2);

        expect(ctrl.invitedMembers.toJS()).to.be.eql([1, 3]);

        ctrl.toggleInvitedMember(5);

        expect(ctrl.invitedMembers.toJS()).to.be.eql([1, 3, 5]);

        return expect(ctrl.checkUsersLimit).to.have.been.called;
    });

    it("get project to duplicate", function() {
        let project = Immutable.fromJS({
            members: [
                {id: 1},
                {id: 2},
                {id: 3}
            ]
        });

        let slug = 'slug';
        ctrl._getInvitedMembers = sinon.stub();

        let promise = mocks.projectsService.getProjectBySlug.withArgs(slug).promise().resolve(project);

        return ctrl.refreshReferenceProject(slug).then(function() {
            expect(ctrl.referenceProject).to.be.equal(project);
            expect(ctrl.members.toJS()).to.be.eql(project.get('members').toJS());
            return expect(ctrl.invitedMembers.toJS()).to.be.eql([1, 2, 3]);
        });
    });

    it('check users limits', function() {
        mocks.currentUserService.canAddMembersPrivateProject.withArgs(4).returns(1);
        mocks.currentUserService.canAddMembersPublicProject.withArgs(4).returns(2);

        let members = Immutable.fromJS([
            {id: 1},
            {id: 2},
            {id: 3}
        ]);
        let { size } = members; //3

        ctrl.user = Immutable.fromJS({
            max_memberships_public_projects: 1,
            max_memberships_private_projects: 1
        });

        ctrl.projectForm = {};
        ctrl.projectForm.is_private = false;
        ctrl.invitedMembers = members;

        ctrl.checkUsersLimit();
        expect(ctrl.limitMembersPrivateProject).to.be.equal(1);
        return expect(ctrl.limitMembersPublicProject).to.be.equal(2);
    });

    it('duplicate project', function(done) {
        ctrl.referenceProject = Immutable.fromJS({
            id: 1
        });
        ctrl.projectForm = Immutable.fromJS({
            id: 1
        });
        let projectId = ctrl.referenceProject.get('id');
        let data = ctrl.projectForm;

        let newProject:any = {};
        newProject.data = {
            slug: 'slug'
        };

        mocks.urlservice.resolve.withArgs("project", {project: newProject.data.slug}).returns("/project/slug/");

        let promise = mocks.projectsService.duplicate.withArgs(projectId, data).promise().resolve(newProject);

        return ctrl.submit().then(function() {
            expect(ctrl.formSubmitLoading).to.be.false;
            expect(mocks.location.path).to.be.calledWith("/project/slug/");
            expect(mocks.currentUserService.loadProjects).to.have.been.called;
            return done();
        });
    });

    it('check if the user can create a private projects', function() {
        mocks.currentUserService.canCreatePrivateProjects = sinon.stub().returns({valid: true});

        ctrl = controller("DuplicateProjectCtrl");
        ctrl.limitMembersPrivateProject = {valid: true};

        ctrl.projectForm = {
            is_private: true
        };

        expect(ctrl.canCreateProject()).to.be.true;

        mocks.currentUserService.canCreatePrivateProjects = sinon.stub().returns({valid: false});

        ctrl = controller("DuplicateProjectCtrl");

        ctrl.projectForm = {
            is_private: true
        };

        return expect(ctrl.canCreateProject()).to.be.false;
    });

    return it('check if the user can create a public projects', function() {
        mocks.currentUserService.canCreatePublicProjects = sinon.stub().returns({valid: true});

        ctrl = controller("DuplicateProjectCtrl");
        ctrl.limitMembersPublicProject = {valid: true};

        ctrl.projectForm = {
            is_private: false
        };

        expect(ctrl.canCreateProject()).to.be.true;

        mocks.currentUserService.canCreatePublicProjects = sinon.stub().returns({valid: false});

        ctrl = controller("DuplicateProjectCtrl");

        ctrl.projectForm = {
            is_private: false
        };

        return expect(ctrl.canCreateProject()).to.be.false;
    });
});
