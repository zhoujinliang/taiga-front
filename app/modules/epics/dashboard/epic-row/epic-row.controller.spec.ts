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
    let epicRowCtrl =  null;
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
            listRelatedUserStories: sinon.stub(),
            updateEpicStatus: sinon.stub(),
            updateEpicAssignedTo: sinon.stub()
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

    it("calculate progress bar in open US", function() {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                status_extra_info: {
                    is_closed: false
                },
                user_stories_counts: {
                    opened: 10,
                    closed: 10
                }
            })
        });

        return expect(ctrl.percentage).to.be.equal("50%");
    });

    it("calculate progress bar in zero US", function() {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                status_extra_info: {
                    is_closed: false
                },
                user_stories_counts: {
                    opened: 0,
                    closed: 0
                }
            })
        });
        return expect(ctrl.percentage).to.be.equal("0%");
    });

    it("calculate progress bar in zero US", function() {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                status_extra_info: {
                    is_closed: true
                }
            })
        });
        return expect(ctrl.percentage).to.be.equal("100%");
    });

    it("Update Epic Status Success", function(done) {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                id: 1,
                version: 1
            })
        });

        let statusId = 1;

        let promise = mocks.tgEpicsService.updateEpicStatus
            .withArgs(ctrl.epic, statusId)
            .promise()
            .resolve();

        ctrl.loadingStatus = true;
        ctrl.displayStatusList = true;

        return ctrl.updateStatus(statusId).then(function() {
            expect(ctrl.loadingStatus).to.be.false;
            expect(ctrl.displayStatusList).to.be.false;
            return done();
        });
    });

    it("Update Epic Status Error", function(done) {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                id: 1,
                version: 1
            })
        });

        let statusId = 1;

        let promise = mocks.tgEpicsService.updateEpicStatus
            .withArgs(ctrl.epic, statusId)
            .promise()
            .reject(new Error('error'));

        return ctrl.updateStatus(statusId).then(function() {
            expect(ctrl.loadingStatus).to.be.false;
            expect(ctrl.displayStatusList).to.be.false;
            expect(mocks.tgConfirm.notify).have.been.calledWith('error');
            return done();
        });
    });

    it("display User Stories", function(done) {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                id: 1
            })
        });

        ctrl.displayUserStories = false;

        let data = Immutable.List();

        let promise = mocks.tgEpicsService.listRelatedUserStories
            .withArgs(ctrl.epic)
            .promise()
            .resolve(data);

        return ctrl.toggleUserStoryList().then(function() {
            expect(ctrl.displayUserStories).to.be.true;
            expect(ctrl.epicStories).is.equal(data);
            return done();
        });
    });

    it("display User Stories error", function(done) {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                id: 1
            })
        });

        ctrl.displayUserStories = false;

        let promise = mocks.tgEpicsService.listRelatedUserStories
            .withArgs(ctrl.epic)
            .promise()
            .reject(new Error('error'));

        return ctrl.toggleUserStoryList().then(function() {
            expect(ctrl.displayUserStories).to.be.false;
            expect(mocks.tgConfirm.notify).have.been.calledWith('error');
            return done();
        });
    });

    return it("display User Stories error", function() {
        let ctrl = controller("EpicRowCtrl", null, {
            epic: Immutable.fromJS({
                id: 1
            })
        });

        ctrl.displayUserStories = true;

        ctrl.toggleUserStoryList();

        return expect(ctrl.displayUserStories).to.be.false;
    });
});
