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
 * File: subscriptions.controller.spec.coffee
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

describe("CommentController", function() {
    let provide = null;
    let controller = null;
    const mocks: any = {};

    const _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            getUser: sinon.stub(),
        };

        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    const _mockTgCheckPermissionsService = function() {
        mocks.tgCheckPermissionsService = {
            check: sinon.stub(),
        };
        return provide.value("tgCheckPermissionsService", mocks.tgCheckPermissionsService);
    };

    const _mockTgLightboxFactory = function() {
        mocks.tgLightboxFactory = {
            create: sinon.stub(),
        };

        return provide.value("tgLightboxFactory", mocks.tgLightboxFactory);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgCurrentUserService();
            _mockTgCheckPermissionsService();
            _mockTgLightboxFactory();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaHistory");
        _mocks();

        inject(($controller) => controller = $controller);

        const commentsCtrl = controller("CommentCtrl");

        commentsCtrl.comment = "comment";
        commentsCtrl.hiddenDeletedComment = true;
        return commentsCtrl.commentContent = commentsCtrl.comment;
    });

    it("show deleted Comment", function() {
        const commentsCtrl = controller("CommentCtrl");
        commentsCtrl.showDeletedComment();
        return expect(commentsCtrl.hiddenDeletedComment).to.be.false;
    });

    it("hide deleted Comment", function() {
        const commentsCtrl = controller("CommentCtrl");

        commentsCtrl.hiddenDeletedComment = false;
        commentsCtrl.hideDeletedComment();
        return expect(commentsCtrl.hiddenDeletedComment).to.be.true;
    });

    it("cancel comment on keyup", function() {
        const commentsCtrl = controller("CommentCtrl");
        commentsCtrl.comment = {
            id: 2,
        };
        const event = {
            keyCode: 27,
        };
        commentsCtrl.onEditMode = sinon.stub();
        commentsCtrl.checkCancelComment(event);

        return expect(commentsCtrl.onEditMode).have.been.called;
    });

    it("can Edit Comment", function() {
        const commentsCtrl = controller("CommentCtrl");

        commentsCtrl.user = Immutable.fromJS({
            id: 7,
        });

        mocks.tgCurrentUserService.getUser.returns(commentsCtrl.user);

        commentsCtrl.comment = {
            user: {
                pk: 7,
            },
        };

        mocks.tgCheckPermissionsService.check.withArgs("modify_project").returns(true);

        const canEdit = commentsCtrl.canEditDeleteComment();
        return expect(canEdit).to.be.true;
    });

    return it("cannot Edit Comment", function() {
        const commentsCtrl = controller("CommentCtrl");

        commentsCtrl.user = Immutable.fromJS({
            id: 8,
        });

        mocks.tgCurrentUserService.getUser.returns(commentsCtrl.user);

        commentsCtrl.comment = {
            user: {
                pk: 7,
            },
        };

        mocks.tgCheckPermissionsService.check.withArgs("modify_project").returns(false);

        const canEdit = commentsCtrl.canEditDeleteComment();
        return expect(canEdit).to.be.false;
    });
});
