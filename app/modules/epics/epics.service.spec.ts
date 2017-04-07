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
 * File: epics.service.spec.coffee
 */

describe("tgEpicsService", function() {
    let provide;
    let epicsService = (provide = null);
    let mocks = {};

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            project: Immutable.Map({
                "id": 1
            })
        };

        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mockTgAttachmentsService = function() {
        mocks.tgAttachmentsService = {
            upload: sinon.stub()
        };

        return provide.value("tgAttachmentsService", mocks.tgAttachmentsService);
    };

    let _mockTgResources = function() {
        mocks.tgResources = {
            epics: {
                list: sinon.stub(),
                post: sinon.stub(),
                patch: sinon.stub(),
                reorder: sinon.stub(),
                reorderRelatedUserstory: sinon.stub()
            },
            userstories: {
                listInEpic: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    let _mockTgXhrErrorService = function() {
        mocks.tgXhrErrorService = {
            response: sinon.stub()
        };

        return provide.value("tgXhrErrorService", mocks.tgXhrErrorService);
    };

    let _inject = callback =>
        inject(function(_tgEpicsService_) {
            epicsService = _tgEpicsService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgProjectService();
            _mockTgAttachmentsService();
            _mockTgResources();
            _mockTgXhrErrorService();
            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaEpics");
        _setup();
        return _inject();
    });

    it("clear epics", function() {
        epicsService._epics = Immutable.List(Immutable.Map({
            'id': 1
        }));

        epicsService.clear();
        return expect(epicsService._epics.size).to.be.equal(0);
    });

    it("fetch epics success", function() {
        let result = {};
        result.list = Immutable.fromJS([
            { id: 111 },
            { id: 112 }
        ]);

        result.headers = () => true;

        let promise = mocks.tgResources.epics.list.withArgs(1).promise();

        let fetchPromise = epicsService.fetchEpics();

        expect(epicsService._loadingEpics).to.be.true;
        expect(epicsService._disablePagination).to.be.true;

        promise.resolve(result);

        return fetchPromise.then(function() {
            expect(epicsService.epics).to.be.equal(result.list);
            expect(epicsService._loadingEpics).to.be.false;
            return expect(epicsService._disablePagination).to.be.false;
        });
    });

    it("fetch epics success, last page", function() {
        let result = {};
        result.list = Immutable.fromJS([
            { id: 111 },
            { id: 112 }
        ]);

        result.headers = () => false;

        let promise = mocks.tgResources.epics.list.withArgs(1).promise();

        let fetchPromise = epicsService.fetchEpics();

        expect(epicsService._loadingEpics).to.be.true;
        expect(epicsService._disablePagination).to.be.true;

        promise.resolve(result);

        return fetchPromise.then(function() {
            expect(epicsService.epics).to.be.equal(result.list);
            expect(epicsService._loadingEpics).to.be.false;
            return expect(epicsService._disablePagination).to.be.true;
        });
    });

    it("fetch epics error", function() {
        let epics = Immutable.fromJS([
            { id: 111 },
            { id: 112 }
        ]);
        let promise = mocks.tgResources.epics.list.withArgs(1).promise().reject(new Error("error"));
        return epicsService.fetchEpics().then(() => expect(mocks.tgXhrErrorService.response.withArgs(new Error("error"))).have.been.calledOnce);
    });

    it("replace epic", function() {
        let epics = Immutable.fromJS([
            { id: 111 },
            { id: 112 }
        ]);

        epicsService._epics = epics;

        let epic = Immutable.Map({
            id: 112,
            title: "title1"
        });

        epicsService.replaceEpic(epic);

        return expect(epicsService._epics.get(1)).to.be.equal(epic);
    });

    it("list related userstories", function() {
        let epic = Immutable.fromJS({
            id: 1
        });
        epicsService.listRelatedUserStories(epic);
        return expect(mocks.tgResources.userstories.listInEpic.withArgs(epic.get('id'))).have.been.calledOnce;
    });

    it("createEpic", function() {
        let epicData = {};
        let epic = Immutable.fromJS({
            id: 111,
            project: 1
        });
        let attachments = Immutable.fromJS([
            {file: "f1"},
            {file: "f2"}
        ]);

        mocks.tgResources.epics
            .post
            .withArgs({project: 1})
            .promise()
            .resolve(epic);

        mocks.tgAttachmentsService
            .upload
            .promise()
            .resolve();

        epicsService.fetchEpics = sinon.stub();
        return epicsService.createEpic(epicData, attachments).then(function() {
            expect(mocks.tgAttachmentsService.upload.withArgs("f1", 111, 1, "epic")).have.been.calledOnce;
            expect(mocks.tgAttachmentsService.upload.withArgs("f2", 111, 1, "epic")).have.been.calledOnce;
            return expect(epicsService.fetchEpics).have.been.calledOnce;
        });
    });

    it("Update epic status", function() {
        let epic = Immutable.fromJS({
            id: 1,
            version: 1
        });

        mocks.tgResources.epics
            .patch
            .withArgs(1, {status: 33, version: 1})
            .promise()
            .resolve();

        epicsService.replaceEpic = sinon.stub();
        return epicsService.updateEpicStatus(epic, 33).then(() => expect(epicsService.replaceEpic).have.been.calledOnce);
    });

    it("Update epic assigned to", function() {
        let epic = Immutable.fromJS({
            id: 1,
            version: 1
        });

        mocks.tgResources.epics
            .patch
            .withArgs(1, {assigned_to: 33, version: 1})
            .promise()
            .resolve();

        epicsService.replaceEpic = sinon.stub();
        return epicsService.updateEpicAssignedTo(epic, 33).then(() => expect(epicsService.replaceEpic).have.been.calledOnce);
    });

    it("reorder epic", function() {
      epicsService._epics = Immutable.fromJS([
          {
              id: 1,
              epics_order: 1,
              version: 1
          },
          {
              id: 2,
              epics_order: 2,
              version: 1
          },
          {
              id: 3,
              epics_order: 3,
              version: 1
          },
      ]);

      mocks.tgResources.epics.reorder
          .withArgs(3, {epics_order: 2, version: 1}, {[1]: 1})
          .promise()
          .resolve(Immutable.fromJS({
              id: 3,
              epics_order: 3,
              version: 2
          }));

      return epicsService.reorderEpic(epicsService._epics.get(2), 1);
    });

    return it("reorder related userstory in epic", function() {
      let epic = Immutable.fromJS({
          id: 1
      });

      let epicUserstories = Immutable.fromJS([
          {
              id: 1,
              epic_order: 1
          },
          {
              id: 2,
              epic_order: 2
          },
          {
              id: 3,
              epic_order: 3
          },
      ]);

      mocks.tgResources.epics.reorderRelatedUserstory
          .withArgs(1, 3, {order: 2}, {[1]: 1})
          .promise()
          .resolve();

      epicsService.listRelatedUserStories = sinon.stub();
      return epicsService.reorderRelatedUserstory(epic, epicUserstories, epicUserstories.get(2), 1).then(() => expect(epicsService.listRelatedUserStories.withArgs(epic)).have.been.calledOnce);
    });
});
