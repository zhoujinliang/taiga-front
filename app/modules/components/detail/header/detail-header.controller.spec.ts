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
 * File: wiki-history.controller.spec.coffee
 */

describe("StoryHeaderComponent", function() {
    let headerDetailCtrl =  null;
    let provide = null;
    let controller = null;
    let rootScope = null;
    let mocks = {};

    let _mockRootScope = function() {
        mocks.rootScope = {
            $broadcast: sinon.stub()
        };

        return provide.value("$rootScope", mocks.rootScope);
    };

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgQueueModelTransformation = function() {
        mocks.modelTransform = {
            save: sinon.stub()
        };

        return provide.value("$tgQueueModelTransformation", mocks.tgQueueModelTransformation);
    };

    let _mockTgNav = function() {
        mocks.navUrls = {
            resolve: sinon.stub().returns('project-issues-detail')
        };

        return provide.value("$tgNavUrls", mocks.navUrls);
    };

    let _mockWindow = function() {
        mocks.window = {
            getSelection: sinon.stub()
        };

        return provide.value("$window", mocks.window);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockRootScope();
            _mockTgConfirm();
            _mockTgQueueModelTransformation();
            _mockTgNav();
            _mockWindow();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaUserStories");

        _mocks();

        inject(function($controller) {
            controller = $controller;

            return headerDetailCtrl = controller("StoryHeaderCtrl", {}, {
                item: {
                    subject: 'Example subject'
                }
            });});

        return headerDetailCtrl.originalSubject = headerDetailCtrl.item.subject;
    });

    it("previous item neighbor", function() {
        headerDetailCtrl.project = {
            slug: 'example_subject'
        };
        headerDetailCtrl.item.neighbors = {
            previous: {
                ref: 42
            }
        };
        headerDetailCtrl._checkNav();
        headerDetailCtrl.previousUrl = mocks.navUrls.resolve("project-issues-detail");
        return expect(headerDetailCtrl.previousUrl).to.be.equal("project-issues-detail");
    });

    it("check permissions", function() {
        headerDetailCtrl.project = {
            my_permissions: ['view_us']
        };
        headerDetailCtrl.requiredPerm = 'view_us';
        headerDetailCtrl._checkPermissions();
        return expect(headerDetailCtrl.permissions).to.be.eql({canEdit: true});
    });

    it("edit subject without selection", function() {
        mocks.window.getSelection.returns({
            type: 'Range'
        });
        headerDetailCtrl.editSubject(true);
        return expect(headerDetailCtrl.editMode).to.be.false;
    });

    it("edit subject on click", function() {
        mocks.window.getSelection.returns({
            type: 'potato'
        });
        headerDetailCtrl.editSubject(true);
        return expect(headerDetailCtrl.editMode).to.be.true;
    });

    it("do not edit subject", function() {
        mocks.window.getSelection.returns({
            type: 'Range'
        });
        headerDetailCtrl.editSubject(false);
        return expect(headerDetailCtrl.editMode).to.be.false;
    });

    it("save on keydown Enter", function() {
        let event = {};
        event.which = 13;
        headerDetailCtrl.saveSubject = sinon.stub();
        headerDetailCtrl.onKeyDown(event);
        return expect(headerDetailCtrl.saveSubject).have.been.called;
    });

    return it("don't save on keydown ESC", function() {
        let event = {};
        event.which = 27;
        headerDetailCtrl.editSubject = sinon.stub();
        headerDetailCtrl.onKeyDown(event);
        expect(headerDetailCtrl.item.subject).to.be.equal(headerDetailCtrl.originalSubject);
        return expect(headerDetailCtrl.editSubject).have.been.calledWith(false);
    });
});
