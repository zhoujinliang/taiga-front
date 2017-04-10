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
 * File: attchments.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("AttachmentsController", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockConfirm = function() {
        mocks.confirm = {};

        return $provide.value("$tgConfirm", mocks.confirm);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return $provide.value("$translate", mocks.translate);
    };

    let _mockConfig = function() {
        mocks.config = {
            get: sinon.stub()
        };

        return $provide.value("$tgConfig", mocks.config);
    };

    let _mockStorage = function() {
        mocks.storage = {
            get: sinon.stub()
        };

        return $provide.value("$tgStorage", mocks.storage);
    };

    let _mockAttachmetsFullService = function() {
        mocks.attachmentsFullService = {};

        return $provide.value("tgAttachmentsFullService", mocks.attachmentsFullService);
    };

    let _mockProjectService = function() {
        mocks.projectService = {
            project: sinon.stub(),
            hasPermission: sinon.stub()
        };

        return $provide.value("tgProjectService", mocks.projectService);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockConfirm();
            _mockTranslate();
            _mockConfig();
            _mockStorage();
            _mockAttachmetsFullService();
            _mockProjectService();

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
        module("taigaComponents");

        return _setup();
    });

    it("toggle deprecated visibility", function() {

        mocks.attachmentsFullService.toggleDeprecatedsVisible = sinon.spy();

        let ctrl = $controller("AttachmentsFull");

        ctrl.toggleDeprecatedsVisible();

        return expect(mocks.attachmentsFullService.toggleDeprecatedsVisible).to.be.calledOnce;
    });

    it("add attachment", function() {
        mocks.attachmentsFullService.addAttachment = sinon.spy();

        let ctrl = $controller("AttachmentsFull");

        let file = Immutable.Map();

        ctrl.projectId = 3;
        ctrl.objId = 30;
        ctrl.type = 'us';
        ctrl.mode = 'list';

        ctrl.addAttachment(file);

        return expect(mocks.attachmentsFullService.addAttachment).to.have.been.calledWith(3, 30, 'us', file, true);
    });

    it("add attachments", function() {
        let ctrl = $controller("AttachmentsFull");

        ctrl.attachments = Immutable.List();
        ctrl.addAttachment = sinon.spy();

        let files = [
            {},
            {},
            {}
        ];

        ctrl.addAttachments(files);

        return expect(ctrl.addAttachment).to.have.callCount(3);
    });

    describe("deleteattachments", function() {
        it("success attachment", function(done) {
            let deleteFile = Immutable.Map();

            mocks.attachmentsFullService.deleteAttachment = sinon.stub();
            mocks.attachmentsFullService.deleteAttachment.withArgs(deleteFile, 'us').promise().resolve();

            let askResponse = {
                finish: sinon.spy()
            };

            mocks.translate.instant.withArgs('ATTACHMENT.TITLE_LIGHTBOX_DELETE_ATTACHMENT').returns('title');
            mocks.translate.instant.withArgs('ATTACHMENT.MSG_LIGHTBOX_DELETE_ATTACHMENT').returns('message');

            mocks.confirm.askOnDelete = sinon.stub();
            mocks.confirm.askOnDelete.withArgs('title', 'message').promise().resolve(askResponse);

            let ctrl = $controller("AttachmentsFull");

            ctrl.type = 'us';

            return ctrl.deleteAttachment(deleteFile).then(function() {
                expect(askResponse.finish).have.been.calledOnce;
                return done();
            });
        });

        return it("error attachment", function(done) {
            let deleteFile = Immutable.Map();

            mocks.attachmentsFullService.deleteAttachment = sinon.stub();
            mocks.attachmentsFullService.deleteAttachment.withArgs(deleteFile, 'us').promise().reject(new Error('error'));

            let askResponse = {
                finish: sinon.spy()
            };

            mocks.translate.instant.withArgs('ATTACHMENT.TITLE_LIGHTBOX_DELETE_ATTACHMENT').returns('title');
            mocks.translate.instant.withArgs('ATTACHMENT.MSG_LIGHTBOX_DELETE_ATTACHMENT').returns('message');
            mocks.translate.instant.withArgs('ATTACHMENT.ERROR_DELETE_ATTACHMENT').returns('error');

            mocks.confirm.askOnDelete = sinon.stub();
            mocks.confirm.askOnDelete.withArgs('title', 'message').promise().resolve(askResponse);

            mocks.confirm.notify = sinon.spy();

            let ctrl = $controller("AttachmentsFull");

            ctrl.type = 'us';

            return ctrl.deleteAttachment(deleteFile).then(function() {
                expect(askResponse.finish.withArgs(false)).have.been.calledOnce;
                expect(mocks.confirm.notify.withArgs('error', null, 'error'));
                return done();
            });
        });
    });

    it("loadAttachments", function() {
        mocks.attachmentsFullService.loadAttachments = sinon.spy();

        let ctrl = $controller("AttachmentsFull");

        ctrl.projectId = 3;
        ctrl.objId = 30;
        ctrl.type = 'us';

        ctrl.loadAttachments();

        return expect(mocks.attachmentsFullService.loadAttachments).to.have.been.calledWith('us', 30, 3);
    });

    it("reorder attachments", function() {
        mocks.attachmentsFullService.reorderAttachment = sinon.spy();

        let ctrl = $controller("AttachmentsFull");

        let file = Immutable.Map();

        ctrl.projectId = 3;
        ctrl.objId = 30;
        ctrl.type = 'us';

        ctrl.reorderAttachment(file, 5);

        return expect(mocks.attachmentsFullService.reorderAttachment).to.have.been.calledWith('us', file, 5);
    });

    it("update attachment", function() {
        mocks.attachmentsFullService.updateAttachment = sinon.spy();

        let ctrl = $controller("AttachmentsFull");

        let file = Immutable.Map();

        ctrl.type = 'us';

        ctrl.updateAttachment(file, 5);

        return expect(mocks.attachmentsFullService.updateAttachment).to.have.been.calledWith(file, 'us');
    });

    it("if attachments editable", function() {
        mocks.projectService.project = true;
        let ctrl = $controller("AttachmentsFull");

        ctrl._isEditable();

        return expect(mocks.projectService.hasPermission).has.been.called;
    });

    return it("if attachments are not editable", function() {
        mocks.projectService.project = false;
        let ctrl = $controller("AttachmentsFull");

        return expect(ctrl._isEditable()).to.be.false;
    });
});
