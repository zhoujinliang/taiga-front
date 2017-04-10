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

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("EpicsDashboard", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };
        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgProjectService = function() {
        mocks.tgProjectService = {
            setProjectBySlug: sinon.stub(),
            hasPermission: sinon.stub(),
            isEpicsDashboardEnabled: sinon.stub(),
            project: Immutable.Map({
                "name": "testing name",
                "description": "testing description"
            })
        };
        return provide.value("tgProjectService", mocks.tgProjectService);
    };

    let _mockTgEpicsService = function() {
        mocks.tgEpicsService = {
            clear: sinon.stub(),
            fetchEpics: sinon.stub()
        };
        return provide.value("tgEpicsService", mocks.tgEpicsService);
    };

    let _mockRouteParams = function() {
        mocks.routeParams = {
            pslug: sinon.stub()
        };

        return provide.value("$routeParams", mocks.routeParams);
    };

    let _mockTgErrorHandlingService = function() {
        mocks.tgErrorHandlingService = {
            permissionDenied: sinon.stub(),
            notFound: sinon.stub()
        };

        return provide.value("tgErrorHandlingService", mocks.tgErrorHandlingService);
    };

    let _mockTgLightboxFactory = function() {
        mocks.tgLightboxFactory = {
            create: sinon.stub()
        };

        return provide.value("tgLightboxFactory", mocks.tgLightboxFactory);
    };

    let _mockLightboxService = function() {
        mocks.lightboxService = {
            closeAll: sinon.stub()
        };

        return provide.value("lightboxService", mocks.lightboxService);
    };

    let _mockTgAppMetaService = function() {
        mocks.tgAppMetaService = {
            setfn: sinon.stub()
        };

        return provide.value("tgAppMetaService", mocks.tgAppMetaService);
    };

    let _mockTranslate = function() {
        mocks.translate = sinon.stub();

        return provide.value("$translate", mocks.translate);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgConfirm();
            _mockTgProjectService();
            _mockTgEpicsService();
            _mockRouteParams();
            _mockTgErrorHandlingService();
            _mockTgLightboxFactory();
            _mockLightboxService();
            _mockTgAppMetaService();
            _mockTranslate();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaEpics");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("metada is set", function() {
        let ctrl = controller("EpicsDashboardCtrl");
        return expect(mocks.tgAppMetaService.setfn).have.been.called;
    });

    it("load data because epics panel is enabled and user has permissions", function(done) {
        let ctrl = controller("EpicsDashboardCtrl");

        mocks.tgProjectService.setProjectBySlug
            .promise()
            .resolve("ok");
        mocks.tgProjectService.hasPermission
            .returns(true);
        mocks.tgProjectService.isEpicsDashboardEnabled
            .returns(true);

        return ctrl.loadInitialData().then(function() {
            expect(mocks.tgErrorHandlingService.permissionDenied).not.have.been.called;
            expect(mocks.tgErrorHandlingService.notFound).not.have.been.called;
            expect(mocks.tgEpicsService.fetchEpics).have.been.called;
            return done();
        });
    });

    it("not load data because epics panel is not enabled", function(done) {
        let ctrl = controller("EpicsDashboardCtrl");

        mocks.tgProjectService.setProjectBySlug
            .promise()
            .resolve("ok");
        mocks.tgProjectService.hasPermission
            .returns(true);
        mocks.tgProjectService.isEpicsDashboardEnabled
            .returns(false);

        return ctrl.loadInitialData().then(function() {
            expect(mocks.tgErrorHandlingService.permissionDenied).not.have.been.called;
            expect(mocks.tgErrorHandlingService.notFound).have.been.called;
            expect(mocks.tgEpicsService.fetchEpics).not.have.been.called;
            return done();
        });
    });

    it("not load data because user has not permissions", function(done) {
        let ctrl = controller("EpicsDashboardCtrl");

        mocks.tgProjectService.setProjectBySlug
            .promise()
            .resolve("ok");
        mocks.tgProjectService.hasPermission
            .returns(false);
        mocks.tgProjectService.isEpicsDashboardEnabled
            .returns(true);

        return ctrl.loadInitialData().then(function() {
            expect(mocks.tgErrorHandlingService.permissionDenied).have.been.called;
            expect(mocks.tgErrorHandlingService.notFound).not.have.been.called;
            expect(mocks.tgEpicsService.fetchEpics).not.have.been.called;
            return done();
        });
    });

    return it("not load data because epics panel is not enabled and user has not permissions", function(done) {
        let ctrl = controller("EpicsDashboardCtrl");

        mocks.tgProjectService.setProjectBySlug
            .promise()
            .resolve("ok");
        mocks.tgProjectService.hasPermission
            .returns(false);
        mocks.tgProjectService.isEpicsDashboardEnabled
            .returns(false);

        return ctrl.loadInitialData().then(function() {
            expect(mocks.tgErrorHandlingService.permissionDenied).not.have.been.called;
            expect(mocks.tgErrorHandlingService.notFound).have.been.called;
            expect(mocks.tgEpicsService.fetchEpics).not.have.been.called;
            return done();
        });
    });
});
