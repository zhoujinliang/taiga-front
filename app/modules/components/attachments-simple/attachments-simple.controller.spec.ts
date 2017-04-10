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
 * File: attchment.controller.spec.coffee
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

describe("AttachmentsSimple", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};
    let scope = null;

    let _mockAttachmentsService = function() {
        mocks.attachmentsService = {};

        return $provide.value("tgAttachmentsService", mocks.attachmentsService);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockAttachmentsService();

            return null;
        })
    ;

    let _inject = () =>
        inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            return scope = $rootScope.$new();
        })
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("add attachment", function() {
        let file = {
            name: 'name',
            size: 1000
        };

        mocks.attachmentsService.validate = sinon.stub();
        mocks.attachmentsService.validate.withArgs(file).returns(true);

        let ctrl = $controller("AttachmentsSimple", {
            $scope: scope
        }, {
            attachments: Immutable.List()
        });

        ctrl.onAdd = sinon.spy();

        ctrl.addAttachment(file);

        expect(ctrl.attachments.size).to.be.equal(1);
        return expect(ctrl.onAdd).to.have.been.calledOnce;
    });

    return it("delete attachment", function() {
        let attachments = Immutable.fromJS([
            {id: 1},
            {id: 2},
            {id: 3}
        ]);

        let ctrl = $controller("AttachmentsSimple", {
            $scope: scope
        }, {
            attachments
        });

        ctrl.onDelete = sinon.spy();


        let attachment = attachments.get(1);

        ctrl.deleteAttachment(attachment);

        expect(ctrl.attachments.size).to.be.equal(2);
        return expect(ctrl.onDelete.withArgs({attachment})).to.have.been.calledOnce;
    });
});
