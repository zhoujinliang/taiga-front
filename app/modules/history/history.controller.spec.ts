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

describe("HistorySection", function() {
    let provide = null;
    let controller = null;
    const mocks: any = {};

    const _mockTgResources = function() {
        mocks.tgResources = {
            history: {
                get: sinon.stub(),
                deleteComment: sinon.stub(),
                undeleteComment: sinon.stub(),
                editComment: sinon.stub(),
            },
        };

        return provide.value("$tgResources", mocks.tgResources);
    };

    const _mockTgRepo = function() {
        mocks.tgRepo = {
            save: sinon.stub(),
        };

        return provide.value("$tgRepo", mocks.tgRepo);
    };

    const _mocktgStorage = function() {
        mocks.tgStorage = {
            get: sinon.stub(),
            set: sinon.stub(),
        };
        return provide.value("$tgStorage", mocks.tgStorage);
    };

    const _mockTgProjectService = function() {
        mocks.tgProjectService = {
            hasPermission: sinon.stub(),
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgResources();
            _mockTgRepo();
            _mocktgStorage();
            _mockTgProjectService();
            return null;
        })
    ;

    beforeEach(function() {
        let promise;
        module("taigaHistory");

        _mocks();

        inject(($controller) => controller = $controller);
        return promise = mocks.tgResources.history.get.promise().resolve();
    });

    it("load historic", function(done) {
        const historyCtrl = controller("HistorySection");

        historyCtrl._getComments = sinon.stub();
        historyCtrl._getActivities = sinon.stub();

        const name = "name";
        const id = 4;

        const promise = mocks.tgResources.history.get.withArgs(name, id).promise().resolve();
        return historyCtrl._loadHistory().then(function(data) {
            expect(historyCtrl._getComments).have.been.calledWith(data);
            expect(historyCtrl._getActivities).have.been.calledWith(data);
            return done();
        });
    });

    it("get Comments older first", function() {
        const historyCtrl = controller("HistorySection");

        const comments = ["comment3", "comment2", "comment1"];
        historyCtrl.reverse = false;

        historyCtrl._getComments(comments);
        expect(historyCtrl.comments).to.be.eql(["comment3", "comment2", "comment1"]);
        return expect(historyCtrl.commentsNum).to.be.equal(3);
    });

    it("get Comments newer first", function() {
        const historyCtrl = controller("HistorySection");

        const comments = ["comment3", "comment2", "comment1"];
        historyCtrl.reverse = true;

        historyCtrl._getComments(comments);
        expect(historyCtrl.comments).to.be.eql(["comment1", "comment2", "comment3"]);
        return expect(historyCtrl.commentsNum).to.be.equal(3);
    });

    it("get activities", function() {
        const historyCtrl = controller("HistorySection");
        const activities = {
            "activity1": {
                values_diff: {"k1": [0, 1]},
            },
            "activity2": {
                values_diff: {"k2": [0, 1]},
            },
            "activity3": {
                values_diff: {"k3": [0, 1]},
            },
        };

        historyCtrl._getActivities(activities);

        historyCtrl.activities = activities;
        return expect(historyCtrl.activitiesNum).to.be.equal(3);
    });

    it("on active history tab", function() {
        const historyCtrl = controller("HistorySection");
        const active = true;
        historyCtrl.onActiveHistoryTab(active);
        return expect(historyCtrl.viewComments).to.be.true;
    });

    it("on inactive history tab", function() {
        const historyCtrl = controller("HistorySection");
        const active = false;
        historyCtrl.onActiveHistoryTab(active);
        return expect(historyCtrl.viewComments).to.be.false;
    });

    it("delete comment", function() {
        const historyCtrl = controller("HistorySection");
        historyCtrl._loadHistory = sinon.stub();

        historyCtrl.name = "type";
        historyCtrl.id = 1;

        const type = historyCtrl.name;
        const objectId = historyCtrl.id;
        const commentId = 7;

        const deleteCommentPromise = mocks.tgResources.history.deleteComment.withArgs(type, objectId, commentId).promise();

        const ctrlPromise = historyCtrl.deleteComment(commentId);
        expect(historyCtrl.deleting).to.be.equal(7);

        deleteCommentPromise.resolve();

        return ctrlPromise.then(function() {
            expect(historyCtrl._loadHistory).have.been.called;
            return expect(historyCtrl.deleting).to.be.null;
        });
    });

    it("edit comment", function() {
        const historyCtrl = controller("HistorySection");
        historyCtrl._loadHistory = sinon.stub();

        historyCtrl.name = "type";
        historyCtrl.id = 1;
        const activityId = 7;
        const comment = "blablabla";

        const type = historyCtrl.name;
        const objectId = historyCtrl.id;
        const commentId = activityId;

        const promise = mocks.tgResources.history.editComment.withArgs(type, objectId, activityId, comment).promise().resolve();

        historyCtrl.editing = 7;
        return historyCtrl.editComment(commentId, comment).then(function() {
            expect(historyCtrl._loadHistory).has.been.called;
            return expect(historyCtrl.editing).to.be.null;
        });
    });

    it("restore comment", function() {
        const historyCtrl = controller("HistorySection");
        historyCtrl._loadHistory = sinon.stub();

        historyCtrl.name = "type";
        historyCtrl.id = 1;
        const activityId = 7;

        const type = historyCtrl.name;
        const objectId = historyCtrl.id;
        const commentId = activityId;

        const promise = mocks.tgResources.history.undeleteComment.withArgs(type, objectId, activityId).promise().resolve();

        historyCtrl.editing = 7;
        return historyCtrl.restoreDeletedComment(commentId).then(function() {
            expect(historyCtrl._loadHistory).has.been.called;
            return expect(historyCtrl.editing).to.be.null;
        });
    });

    it("add comment", function() {
        const historyCtrl = controller("HistorySection");
        historyCtrl._loadHistory = sinon.stub();

        historyCtrl.type = "type";
        const { type } = historyCtrl;

        const cb = sinon.spy();

        const promise = mocks.tgRepo.save.withArgs(type).promise().resolve();

        return historyCtrl.addComment(cb).then(function() {
            expect(historyCtrl._loadHistory).has.been.called;
            return expect(cb).to.have.been.called;
        });
    });

    return it("order comments", function() {
        const historyCtrl = controller("HistorySection");
        historyCtrl._loadHistory = sinon.stub();

        historyCtrl.reverse = false;

        historyCtrl.onOrderComments();
        expect(historyCtrl.reverse).to.be.true;
        expect(mocks.tgStorage.set).has.been.calledWith("orderComments", historyCtrl.reverse);
        return expect(historyCtrl._loadHistory).has.been.called;
    });
});
