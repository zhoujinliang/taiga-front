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
 * File: lb/contact-project-button.controller.spec.coffee
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

describe("LbContactProject", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgLightboxSercice = function() {
        mocks.tglightboxService = {
            closeAll: sinon.stub()
        };

        return provide.value("lightboxService", mocks.tglightboxService);
    };

    let _mockTgResources = function() {
        mocks.tgResources = {
            projects: {
                contactProject: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.tgResources);
    };

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgLightboxSercice();
            _mockTgResources();
            _mockTgConfirm();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");

        _mocks();

        return inject($controller => controller = $controller);
    });

    return it("Contact Project", function(done) {
        let ctrl = controller("ContactProjectLbCtrl");
        ctrl.contact = {
            message: 'abcde'
        };
        ctrl.project = Immutable.fromJS({
            id: 1
        });

        let project = ctrl.project.get('id');
        let { message } = ctrl.contact;

        let promise = mocks.tgResources.projects.contactProject.withArgs(project, message).promise().resolve();

        ctrl.sendingFeedback = true;

        return ctrl.contactProject().then(function() {
            expect(mocks.tglightboxService.closeAll).have.been.called;
            expect(ctrl.sendingFeedback).to.be.false;
            expect(mocks.tgConfirm.notify).have.been.calledWith("success");
            return done();
        });
    });
});
