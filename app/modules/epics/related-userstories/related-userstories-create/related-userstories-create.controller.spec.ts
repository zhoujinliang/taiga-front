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
 * File: related-userstories-create.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("RelatedUserstoriesCreate", function() {
    let RelatedUserstoriesCreateCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgCurrentUserService = function() {
        mocks.tgCurrentUserService = {
            projects: {
                get: sinon.stub()
            }
        };

        return provide.value("tgCurrentUserService", mocks.tgCurrentUserService);
    };

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            askOnDelete: sinon.stub(),
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };


    let _mockTgResources = function() {
        mocks.tgResources = {
            userstories: {
                listAllInProject: sinon.stub()
            },
            epics: {
                deleteRelatedUserstory: sinon.stub(),
                addRelatedUserstory: sinon.stub(),
                bulkCreateRelatedUserStories: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    let _mockTgAnalytics = function() {
        mocks.tgAnalytics = {
            trackEvent: sinon.stub()
        };

        return provide.value("$tgAnalytics", mocks.tgAnalytics);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgCurrentUserService();
            _mockTgConfirm();
            _mockTgResources();
            _mockTgAnalytics();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        inject($controller => controller = $controller);

        return RelatedUserstoriesCreateCtrl = controller("RelatedUserstoriesCreateCtrl");
    });

    it("select project", function(done) {
        // This test tries to reproduce a project containing userstories 11 and 12 where 11
        // is yet related to the epic
        RelatedUserstoriesCreateCtrl.epicUserstories = Immutable.fromJS([
            {
                id: 11
            }
        ]);

        let onSelectedProjectCallback = sinon.stub();
        let userstories = Immutable.fromJS([
            {
                id: 11
            },
            {

                id: 12
            }
        ]);
        let filteredUserstories = Immutable.fromJS([
            {

                id: 12
            }
        ]);

        let promise = mocks.tgResources.userstories.listAllInProject.withArgs(1).promise().resolve(userstories);
        return RelatedUserstoriesCreateCtrl.selectProject(1, onSelectedProjectCallback).then(function() {
            expect(RelatedUserstoriesCreateCtrl.projectUserstories.toJS()).to.eql(filteredUserstories.toJS());
            return done();
        });
    });

    it("save related user story success", function(done) {
        RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm = sinon.stub();
        RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm.returns(true);
        let onSavedRelatedUserstoryCallback = sinon.stub();
        onSavedRelatedUserstoryCallback.returns(true);
        RelatedUserstoriesCreateCtrl.loadRelatedUserstories = sinon.stub();
        RelatedUserstoriesCreateCtrl.epic = Immutable.fromJS({
            id: 1
        });
        let promise = mocks.tgResources.epics.addRelatedUserstory.withArgs(1, 11).promise().resolve(true);
        return RelatedUserstoriesCreateCtrl.saveRelatedUserStory(11, onSavedRelatedUserstoryCallback).then(function() {
            expect(RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm).have.been.calledOnce;
            expect(onSavedRelatedUserstoryCallback).have.been.calledOnce;
            expect(mocks.tgResources.epics.addRelatedUserstory).have.been.calledWith(1, 11);
            expect(mocks.tgAnalytics.trackEvent).have.been.calledWith("epic related user story", "create", "create related user story on epic", 1);
            expect(RelatedUserstoriesCreateCtrl.loadRelatedUserstories).have.been.calledOnce;
            return done();
        });
    });

    it("save related user story error", function(done) {
        RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm = sinon.stub();
        RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm.returns(true);
        let onSavedRelatedUserstoryCallback = sinon.stub();
        RelatedUserstoriesCreateCtrl.setExistingUserstoryFormErrors = sinon.stub();
        RelatedUserstoriesCreateCtrl.setExistingUserstoryFormErrors.returns({});
        RelatedUserstoriesCreateCtrl.epic = Immutable.fromJS({
            id: 1
        });
        let promise = mocks.tgResources.epics.addRelatedUserstory.withArgs(1, 11).promise().reject(new Error("error"));
        return RelatedUserstoriesCreateCtrl.saveRelatedUserStory(11, onSavedRelatedUserstoryCallback).then(function() {
            expect(RelatedUserstoriesCreateCtrl.validateExistingUserstoryForm).have.been.calledOnce;
            expect(onSavedRelatedUserstoryCallback).to.not.have.been.called;
            expect(mocks.tgResources.epics.addRelatedUserstory).have.been.calledWith(1, 11);
            expect(mocks.tgConfirm.notify).have.been.calledWith("error");
            expect(RelatedUserstoriesCreateCtrl.setExistingUserstoryFormErrors).have.been.calledOnce;
            return done();
        });
    });

    it("bulk create related user stories success", function(done) {
        RelatedUserstoriesCreateCtrl.validateNewUserstoryForm = sinon.stub();
        RelatedUserstoriesCreateCtrl.validateNewUserstoryForm.returns(true);
        let onCreatedRelatedUserstoryCallback = sinon.stub();
        onCreatedRelatedUserstoryCallback.returns(true);
        RelatedUserstoriesCreateCtrl.loadRelatedUserstories = sinon.stub();
        RelatedUserstoriesCreateCtrl.epic = Immutable.fromJS({
            id: 1
        });
        let promise = mocks.tgResources.epics.bulkCreateRelatedUserStories.withArgs(1, 22, 'a\nb').promise().resolve(true);
        return RelatedUserstoriesCreateCtrl.bulkCreateRelatedUserStories(22, 'a\nb', onCreatedRelatedUserstoryCallback).then(function() {
            expect(RelatedUserstoriesCreateCtrl.validateNewUserstoryForm).have.been.calledOnce;
            expect(onCreatedRelatedUserstoryCallback).have.been.calledOnce;
            expect(mocks.tgResources.epics.bulkCreateRelatedUserStories).have.been.calledWith(1, 22, 'a\nb');
            expect(mocks.tgAnalytics.trackEvent).have.been.calledWith("epic related user story", "create", "create related user story on epic", 1);
            expect(RelatedUserstoriesCreateCtrl.loadRelatedUserstories).have.been.calledOnce;
            return done();
        });
    });

    return it("bulk create related user stories error", function(done) {
        RelatedUserstoriesCreateCtrl.validateNewUserstoryForm = sinon.stub();
        RelatedUserstoriesCreateCtrl.validateNewUserstoryForm.returns(true);
        let onCreatedRelatedUserstoryCallback = sinon.stub();
        RelatedUserstoriesCreateCtrl.setNewUserstoryFormErrors = sinon.stub();
        RelatedUserstoriesCreateCtrl.setNewUserstoryFormErrors.returns({});
        RelatedUserstoriesCreateCtrl.epic = Immutable.fromJS({
            id: 1
        });
        let promise = mocks.tgResources.epics.bulkCreateRelatedUserStories.withArgs(1, 22, 'a\nb').promise().reject(new Error("error"));
        return RelatedUserstoriesCreateCtrl.bulkCreateRelatedUserStories(22, 'a\nb', onCreatedRelatedUserstoryCallback).then(function() {
            expect(RelatedUserstoriesCreateCtrl.validateNewUserstoryForm).have.been.calledOnce;
            expect(onCreatedRelatedUserstoryCallback).to.not.have.been.called;
            expect(mocks.tgResources.epics.bulkCreateRelatedUserStories).have.been.calledWith(1, 22, 'a\nb');
            expect(mocks.tgConfirm.notify).have.been.calledWith("error");
            expect(RelatedUserstoriesCreateCtrl.setNewUserstoryFormErrors).have.been.calledOnce;
            return done();
        });
    });
});
