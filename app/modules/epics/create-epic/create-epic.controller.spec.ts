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
 * File: epic-row.controller.spec.coffee
 */

describe("EpicRow", function() {
    let createEpicCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks = {};

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };
        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            project: {
                toJS: sinon.stub()
            }
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mockTgEpicsService = function() {
        mocks.tgEpicsService = {
            createEpic: sinon.stub()
        };
        return provide.value("tgEpicsService", mocks.tgEpicsService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgConfirm();
            _mockTgProjectService();
            _mockTgEpicsService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("create Epic with invalid form", function() {
        mocks.tgProjectService.project.toJS.withArgs().returns(
            {id: 1, default_epic_status: 1}
        );

        let data = {
            validateForm: sinon.stub(),
            setFormErrors: sinon.stub(),
            onCreateEpic: sinon.stub()
        };
        createEpicCtrl = controller("CreateEpicCtrl", null, data);
        createEpicCtrl.attachments = Immutable.List([{file: "file1"}, {file: "file2"}]);

        data.validateForm.withArgs().returns(false);

        createEpicCtrl.createEpic();

        expect(data.validateForm).have.been.called;
        return expect(mocks.tgEpicsService.createEpic).not.have.been.called;
    });

    return it("create Epic successfully", function(done) {
        mocks.tgProjectService.project.toJS.withArgs().returns(
            {id: 1, default_epic_status: 1}
        );

        let data = {
            validateForm: sinon.stub(),
            setFormErrors: sinon.stub(),
            onCreateEpic: sinon.stub()
        };
        createEpicCtrl = controller("CreateEpicCtrl", null, data);
        createEpicCtrl.attachments = Immutable.List([{file: "file1"}, {file: "file2"}]);

        data.validateForm.withArgs().returns(true);
        mocks.tgEpicsService.createEpic
            .withArgs(
                createEpicCtrl.newEpic,
                createEpicCtrl.attachments)
            .promise()
            .resolve(
                {data: {id: 1, project: 1}}
            );

        return createEpicCtrl.createEpic().then(function() {
            expect(data.validateForm).have.been.called;
            expect(createEpicCtrl.onCreateEpic).have.been.called;
            return done();
        });
    });
});
