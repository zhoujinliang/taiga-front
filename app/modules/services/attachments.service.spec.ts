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
 * File: attachments.service.spec.coffee
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

describe("tgAttachmentsService", function() {
    let provide;
    let attachmentsService = (provide = null);
    let mocks:any = {};

    let _mockTgConfirm = function() {
        mocks.confirm = {
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.confirm);
    };

    let _mockTgConfig = function() {
        mocks.config = {
            get: sinon.stub()
        };

        mocks.config.get.withArgs('maxUploadFileSize', null).returns(3000);

        return provide.value("$tgConfig", mocks.config);
    };

    let _mockRs = function() {
        mocks.rs = {};

        return provide.value("tgResources", mocks.rs);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return provide.value("$translate", mocks.translate);
    };


    let _inject = (callback=null) =>
        inject(function(_tgAttachmentsService_) {
            attachmentsService = _tgAttachmentsService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgConfirm();
            _mockTgConfig();
            _mockRs();
            _mockTranslate();

            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaCommon");
        _setup();
        return _inject();
    });

    it("maxFileSize formated", () => expect(attachmentsService.maxFileSizeFormated).to.be.equal("2.9 KB"));

    it("sizeError, send notification", function() {
        let file = {
            name: 'test',
            size: 3000
        };

        mocks.translate.instant.withArgs('ATTACHMENT.ERROR_MAX_SIZE_EXCEEDED').returns('message');

        attachmentsService.sizeError(file);

        return expect(mocks.confirm.notify).to.have.been.calledWith('error', 'message');
    });

    it("invalid, validate", function() {
        let file = {
            name: 'test',
            size: 4000
        };

        let result = attachmentsService.validate(file);

        return expect(result).to.be.false;
    });

    it("valid, validate", function() {
        let file = {
            name: 'test',
            size: 1000
        };

        let result = attachmentsService.validate(file);

        return expect(result).to.be.true;
    });

    it("get max file size", function() {
        let result = attachmentsService.getMaxFileSize();

        return expect(result).to.be.equal(3000);
    });

    it("delete", function() {
        mocks.rs.attachments = {
            delete: sinon.stub()
        };

        attachmentsService.delete('us', 2);

        return expect(mocks.rs.attachments.delete).to.have.been.calledWith('us', 2);
    });

    it("upload", function(done) {
        let file = {
            id: 1
        };

        let objId = 2;
        let projectId = 2;
        let type = 'us';

        mocks.rs.attachments = {
            create: (<any>sinon.stub()).promise()
        };

        mocks.rs.attachments.create.withArgs('us', type, objId, file).resolve();

        attachmentsService.sizeError = sinon.spy();

        return attachmentsService.upload(file, objId, projectId, 'us').then(function() {
            expect(mocks.rs.attachments.create).to.have.been.calledOnce;
            return done();
        });
     });

    it("patch", function(done) {
        let file = {
            id: 1
        };

        let objId = 2;
        let type = 'us';

        let patch = {
            id: 2
        };

        mocks.rs.attachments = {
            patch: (<any>sinon.stub()).promise()
        };

        mocks.rs.attachments.patch.withArgs('us', objId, patch).resolve();

        attachmentsService.sizeError = sinon.spy();

        return attachmentsService.patch(objId, 'us', patch).then(function() {
            expect(mocks.rs.attachments.patch).to.have.been.calledOnce;
            return done();
        });
    });

    return it("error", function() {
        mocks.translate.instant.withArgs("ATTACHMENT.ERROR_MAX_SIZE_EXCEEDED").returns("msg");

        attachmentsService.sizeError({
            name: 'name',
            size: 123
        });

        return expect(mocks.confirm.notify).to.have.been.calledWith('error', 'msg');
    });
});
