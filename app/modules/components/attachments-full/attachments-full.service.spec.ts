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
 * File: attchments-full.service.spec.coffee
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

describe("tgAttachmentsFullService", function() {
    let $provide = null;
    let attachmentsFullService = null;
    let mocks:any = {};

    let _mockAttachmentsService = function() {
        mocks.attachmentsService = {
            upload: sinon.stub()
        };

        return $provide.value("tgAttachmentsService", mocks.attachmentsService);
    };

    let _mockRootScope = function() {
        mocks.rootScope = {};

        return $provide.value("$rootScope", mocks.rootScope);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockAttachmentsService();
            _mockRootScope();

            return null;
        })
    ;

    let _inject = () =>
        inject(_tgAttachmentsFullService_ => attachmentsFullService = _tgAttachmentsFullService_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("generate, refresh deprecated counter", function() {
        let attachments = Immutable.fromJS([
            {
                file: {
                    is_deprecated: false
                }
            },
            {
                file: {
                    is_deprecated: true
                }
            },
            {
                file: {
                    is_deprecated: true
                }
            },
            {
                file: {
                    is_deprecated: false
                }
            },
            {
                file: {
                    is_deprecated: true
                }
            }
        ]);

        attachmentsFullService._attachments = attachments;

        attachmentsFullService.regenerate();

        return expect(attachmentsFullService._deprecatedsCount).to.be.equal(3);
    });

    it("toggle deprecated visibility", function() {
        attachmentsFullService._deprecatedsVisible = false;

        attachmentsFullService.regenerate = sinon.spy();

        attachmentsFullService.toggleDeprecatedsVisible();

        expect(attachmentsFullService.deprecatedsVisible).to.be.true;
        return expect(attachmentsFullService.regenerate).to.be.calledOnce;
    });

    describe("add attachments", function() {
        it("valid attachment", function(done) {
            let projectId = 1;
            let objId = 2;
            let type = "issue";

            let file = Immutable.fromJS({
                file: {},
                name: 'test',
                size: 3000
            });

            mocks.attachmentsService.validate = sinon.stub();
            mocks.attachmentsService.validate.withArgs(file).returns(true);

            mocks.attachmentsService.upload = sinon.stub();
            mocks.attachmentsService.upload.promise().resolve(file);

            mocks.rootScope.$broadcast = sinon.spy();

            attachmentsFullService._attachments = Immutable.List();

            return attachmentsFullService.addAttachment(projectId, objId, type, file).then(function() {
                expect(mocks.rootScope.$broadcast).have.been.calledWith('attachment:create');
                expect(attachmentsFullService.attachments.count()).to.be.equal(1);
                return done();
            });
        });

        return it("invalid attachment", function() {
            let file = Immutable.fromJS({
                file: {},
                name: 'test',
                size: 3000
            });

            mocks.attachmentsService.validate = sinon.stub();
            mocks.attachmentsService.validate.withArgs(file).returns(false);

            mocks.attachmentsService.upload = sinon.stub();
            mocks.attachmentsService.upload.promise().resolve(file);

            mocks.rootScope.$broadcast = sinon.spy();

            attachmentsFullService._attachments = Immutable.List();

            return attachmentsFullService.addAttachment(file).then(null, () => expect(attachmentsFullService._attachments.count()).to.be.equal(0));
        });
    });

    describe("deleteattachments", () =>
        it("success attachment", function(done) {
            mocks.attachmentsService.delete = sinon.stub();
            mocks.attachmentsService.delete.withArgs('us', 2).promise().resolve();

            attachmentsFullService.regenerate = sinon.spy();
            attachmentsFullService._attachments = Immutable.fromJS([
                {
                    file: {id: 1}
                },
                {
                    file: {id: 2}
                },
                {
                    file: {id: 3}
                },
                {
                    file: {id: 4}
                }
            ]);

            let deleteFile = attachmentsFullService._attachments.get(1);

            return attachmentsFullService.deleteAttachment(deleteFile, 'us').then(function() {
                expect(attachmentsFullService.regenerate).have.been.calledOnce;
                expect(attachmentsFullService.attachments.size).to.be.equal(3);
                return done();
            });
        })
    );

    it("reorder attachments", function(done) {
        let attachments = Immutable.fromJS([
            {file: {id: 0, is_deprecated: false, order: 0}},
            {file: {id: 1, is_deprecated: true, order: 1}},
            {file: {id: 2, is_deprecated: true, order: 2}},
            {file: {id: 3, is_deprecated: false, order: 3}},
            {file: {id: 4, is_deprecated: true, order: 4}}
        ]);

        mocks.attachmentsService.patch = sinon.stub();
        mocks.attachmentsService.patch.promise().resolve();

        attachmentsFullService._attachments = attachments;

        return attachmentsFullService.reorderAttachment('us', attachments.get(1), 0).then(function() {
            expect(attachmentsFullService.attachments.get(0)).to.be.equal(attachments.get(1));
            return done();
        });
    });

    it("update attachment", function() {
        let attachments = Immutable.fromJS([
            {file: {id: 0, is_deprecated: false, order: 0}},
            {file: {id: 1, is_deprecated: true, order: 1}},
            {file: {id: 2, is_deprecated: true, order: 2}},
            {file: {id: 3, is_deprecated: false, order: 3}},
            {file: {id: 4, is_deprecated: true, order: 4}}
        ]);

        let attachment = attachments.get(1);
        attachment = attachment.setIn(['file', 'is_deprecated'], false);

        mocks.attachmentsService.patch = sinon.stub();
        mocks.attachmentsService.patch.withArgs(1, 'us', {is_deprecated: false}).promise().resolve();

        attachmentsFullService._attachments = attachments;

        return attachmentsFullService.updateAttachment(attachment, 'us').then(() => expect(attachmentsFullService.attachments.get(1).toJS()).to.be.eql(attachment.toJS()));
    });

    return it("update loading attachment", function() {
        let attachments = Immutable.fromJS([
            {file: {id: 0, is_deprecated: false, order: 0}},
            {loading: true, file: {id: 1, is_deprecated: true, order: 1}},
            {file: {id: 2, is_deprecated: true, order: 2}},
            {file: {id: 3, is_deprecated: false, order: 3}},
            {file: {id: 4, is_deprecated: true, order: 4}}
        ]);

        let attachment = attachments.get(1);
        attachment = attachment.setIn(['file', 'is_deprecated'], false);

        mocks.attachmentsService.patch = sinon.stub();
        mocks.attachmentsService.patch.withArgs(1, 'us', {is_deprecated: false}).promise().resolve();

        attachmentsFullService._attachments = attachments;

        attachmentsFullService.updateAttachment(attachment, 'us');

        return expect(attachmentsFullService.attachments.get(1).toJS()).to.be.eql(attachment.toJS());
    });
});
