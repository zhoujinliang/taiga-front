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
 * File: invite-members-form.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("InviteMembersFormController", function() {
    let inviteMembersFormCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockProjectService = function() {
        mocks.projectService = {
            project: sinon.stub(),
            fetchProject: sinon.stub()
        };

        return provide.value("tgProjectService", mocks.projectService);
    };

    let _mockTgResources = function() {
        mocks.tgResources = {
            memberships: {
                bulkCreateMemberships: sinon.stub()
            }
        };

        return provide.value("$tgResources", mocks.tgResources);
    };

    let _mockLightboxService = function() {
        mocks.lightboxService = {
            closeAll: sinon.stub()
        };

        return provide.value("lightboxService", mocks.lightboxService);
    };

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockRootScope = function() {
        mocks.rootScope = {
            $broadcast: sinon.stub()
        };

        return provide.value("$rootScope", mocks.rootScope);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockProjectService();
            _mockTgResources();
            _mockLightboxService();
            _mockTgConfirm();
            _mockRootScope();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaAdmin");

        _mocks();

        inject($controller => controller = $controller);

        return mocks.projectService.project = Immutable.fromJS([{
            'roles': 'role1'
        }]);
    });

    it("check limit memberships - no limit", function() {
        inviteMembersFormCtrl = controller("InviteMembersFormCtrl");

        inviteMembersFormCtrl.project = Immutable.fromJS({
            'max_memberships': null,
        });

        inviteMembersFormCtrl.defaultMaxInvites = 4;

        inviteMembersFormCtrl._checkLimitMemberships();
        expect(inviteMembersFormCtrl.membersLimit).to.be.equal(4);
        return expect(inviteMembersFormCtrl.showWarningMessage).to.be.false;
    });

    it("check limit memberships", function() {
        inviteMembersFormCtrl = controller("InviteMembersFormCtrl");

        inviteMembersFormCtrl.project = Immutable.fromJS({
            'max_memberships': 15,
            'total_memberships': 13
        });
        inviteMembersFormCtrl.defaultMaxInvites = 4;

        inviteMembersFormCtrl._checkLimitMemberships();
        expect(inviteMembersFormCtrl.membersLimit).to.be.equal(2);
        return expect(inviteMembersFormCtrl.showWarningMessage).to.be.true;
    });


    return it("send invites", function(done) {
        inviteMembersFormCtrl = controller("InviteMembersFormCtrl");
        inviteMembersFormCtrl.project = Immutable.fromJS(
            {'id': 1}
        );
        inviteMembersFormCtrl.rolesValues = {'user1': 1};
        inviteMembersFormCtrl.inviteContactsMessage = 'Message';
        inviteMembersFormCtrl.loading = true;

        mocks.tgResources.memberships.bulkCreateMemberships.withArgs(
            1,
            [{
                'role_id': 1,
                'username': 'user1'
            }],
            'Message'
        ).promise().resolve();

        mocks.projectService.fetchProject.withArgs().promise().resolve();

        return inviteMembersFormCtrl.sendInvites().then(function() {
            expect(inviteMembersFormCtrl.loading).to.be.false;
            expect(mocks.rootScope.$broadcast).to.have.been.calledWith("membersform:new:success");
            expect(mocks.tgConfirm.notify).to.have.been.calledWith("success");
            return done();
        });
    });
});
