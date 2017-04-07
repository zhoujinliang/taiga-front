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
 * File: related-userstory-row.controller.spec.coffee
 */

describe("RelatedUserstoryRow", function() {
    let RelatedUserstoryRowCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks = {};

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            askOnDelete: sinon.stub(),
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgAvatarService = function() {
        mocks.tgAvatarService = {
            getAvatar: sinon.stub()
        };

        return provide.value("tgAvatarService", mocks.tgAvatarService);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return provide.value("$translate", mocks.translate);
    };

    let _mockTgResources = function() {
        mocks.tgResources = {
            epics: {
                deleteRelatedUserstory: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgConfirm();
            _mockTgAvatarService();
            _mockTranslate();
            _mockTgResources();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        inject($controller => controller = $controller);

        return RelatedUserstoryRowCtrl = controller("RelatedUserstoryRowCtrl");
    });

    it("set avatar data", function(done) {
        RelatedUserstoryRowCtrl.userstory = Immutable.fromJS({
            assigned_to_extra_info: {
                id: 3
            }
        });
        let member = RelatedUserstoryRowCtrl.userstory.get("assigned_to_extra_info");
        let avatar = {
            url: "http://taiga.io",
            bg: "#AAAAAA"
        };
        mocks.tgAvatarService.getAvatar.withArgs(member).returns(avatar);
        RelatedUserstoryRowCtrl.setAvatarData();
        expect(mocks.tgAvatarService.getAvatar).have.been.calledWith(member);
        expect(RelatedUserstoryRowCtrl.avatar).is.equal(avatar);
        return done();
    });

    it("get assigned to full name display for existing user", function(done) {
        RelatedUserstoryRowCtrl.userstory = Immutable.fromJS({
            assigned_to: 1,
            assigned_to_extra_info: {
              full_name_display: "Beta tester"
            }
        });

        expect(RelatedUserstoryRowCtrl.getAssignedToFullNameDisplay()).is.equal("Beta tester");
        return done();
    });

    it("get assigned to full name display for unassigned user story", function(done) {
        RelatedUserstoryRowCtrl.userstory = Immutable.fromJS({
            assigned_to: null
        });
        mocks.translate.instant.withArgs("COMMON.ASSIGNED_TO.NOT_ASSIGNED").returns("Unassigned");
        expect(RelatedUserstoryRowCtrl.getAssignedToFullNameDisplay()).is.equal("Unassigned");
        return done();
    });

    it("delete related userstory success", function(done) {
        RelatedUserstoryRowCtrl.epic = Immutable.fromJS({
            id: 123
        });
        RelatedUserstoryRowCtrl.userstory = Immutable.fromJS({
            subject: "Deleting",
            id: 124
        });

        RelatedUserstoryRowCtrl.loadRelatedUserstories = sinon.stub();

        let askResponse = {
            finish: sinon.spy()
        };

        mocks.translate.instant.withArgs("EPIC.TITLE_LIGHTBOX_UNLINK_RELATED_USERSTORY").returns("title");
        mocks.translate.instant.withArgs("EPIC.MSG_LIGHTBOX_UNLINK_RELATED_USERSTORY", {subject: "Deleting"}).returns("message");

        mocks.tgConfirm.askOnDelete = sinon.stub();
        mocks.tgConfirm.askOnDelete.withArgs("title", "message").promise().resolve(askResponse);

        let promise = mocks.tgResources.epics.deleteRelatedUserstory.withArgs(123, 124).promise().resolve(true);
        return RelatedUserstoryRowCtrl.onDeleteRelatedUserstory().then(function() {
            expect(RelatedUserstoryRowCtrl.loadRelatedUserstories).have.been.calledOnce;
            expect(askResponse.finish).have.been.calledOnce;
            return done();
        });
    });

    return it("delete related userstory error", function(done) {
        RelatedUserstoryRowCtrl.epic = Immutable.fromJS({
            id: 123
        });
        RelatedUserstoryRowCtrl.userstory = Immutable.fromJS({
            subject: "Deleting",
            id: 124
        });

        RelatedUserstoryRowCtrl.loadRelatedUserstories = sinon.stub();

        let askResponse = {
            finish: sinon.spy()
        };

        mocks.translate.instant.withArgs("EPIC.TITLE_LIGHTBOX_UNLINK_RELATED_USERSTORY").returns("title");
        mocks.translate.instant.withArgs("EPIC.MSG_LIGHTBOX_UNLINK_RELATED_USERSTORY", {subject: "Deleting"}).returns("message");
        mocks.translate.instant.withArgs("EPIC.ERROR_UNLINK_RELATED_USERSTORY", {errorMessage: "message"}).returns("error message");

        mocks.tgConfirm.askOnDelete = sinon.stub();
        mocks.tgConfirm.askOnDelete.withArgs("title", "message").promise().resolve(askResponse);

        let promise = mocks.tgResources.epics.deleteRelatedUserstory.withArgs(123, 124).promise().reject(new Error("error"));
        return RelatedUserstoryRowCtrl.onDeleteRelatedUserstory().then(function() {
            expect(RelatedUserstoryRowCtrl.loadRelatedUserstories).to.not.have.been.called;
            expect(askResponse.finish).have.been.calledWith(false);
            expect(mocks.tgConfirm.notify).have.been.calledWith("error", null, "error message");
            return done();
        });
    });
});
