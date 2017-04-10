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
 * File: transfer-project.controller.spec.coffee
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

describe("TransferProject", function() {
    let $controller = null;
    let $q = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let _mockRouteParams = function() {
        mocks.routeParams = {};
        return provide.value("$routeParams", mocks.routeParams);
    };

    let _mockErrorHandlingService = function() {
        mocks.errorHandlingService = {
            notfound: sinon.stub()
        };

        return provide.value("tgErrorHandlingService", mocks.errorHandlingService);
    };

    let _mockProjectsService = function() {
        mocks.projectsService = {
            transferValidateToken: sinon.stub(),
            transferAccept: sinon.stub(),
            transferReject: sinon.stub()
        };

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    let _mockLocation = function() {
        mocks.location = {
            path: sinon.stub()
        };
        return provide.value("$location", mocks.location);
    };

    let _mockAuth = function() {
        mocks.auth = {
            refresh: sinon.stub()
        };

        return provide.value("$tgAuth", mocks.auth);
    };

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            getUser: sinon.stub(),
            canOwnProject: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub()
        };

        return provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return provide.value("$translate", mocks.translate);
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
            _mockRouteParams();
            _mockProjectsService();
            _mockLocation();
            _mockAuth();
            _mockCurrentUserService();
            _mockTgNavUrls();
            _mockTranslate();
            _mockTgConfirm();
            _mockErrorHandlingService();
            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$q_, _$rootScope_) {
            $q = _$q_;
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProjects");
        _mocks();
        return _inject();
    });

    it("invalid token", function(done) {
        let project = Immutable.fromJS({
            id: 1
        });

        let user = Immutable.fromJS({});

        mocks.auth.refresh.promise().resolve();
        mocks.routeParams.token = "BAD_TOKEN";
        mocks.currentUserService.getUser.returns(user);
        mocks.projectsService.transferValidateToken.withArgs(1, "BAD_TOKEN").promise().reject(new Error('error'));
        mocks.tgNavUrls.resolve.withArgs("not-found").returns("/not-found");

        let ctrl = $controller("TransferProjectController");
        ctrl.project = project;
        return ctrl.initialize().then(function() {
            expect(mocks.errorHandlingService.notfound).have.been.called;
            return done();
        });
    });

    it("valid token private project with max projects for user", function(done) {
        let project = Immutable.fromJS({
            id: 1,
            is_private: true
        });

        let user = Immutable.fromJS({
            max_private_projects: 1,
            total_private_projects: 1,
            max_memberships_private_projects: 25
        });

        mocks.auth.refresh.promise().resolve();
        mocks.routeParams.token = "TOKEN";
        mocks.currentUserService.getUser.returns(user);
        mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();

        let ctrl = $controller("TransferProjectController");
        ctrl.project = project;
        return ctrl.initialize().then(function() {
            expect(ctrl.ownerMessage).to.be.equal("ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PRIVATE");
            expect(ctrl.maxProjects).to.be.equal(1);
            expect(ctrl.currentProjects).to.be.equal(1);
            return done();
        });
    });

    it("valid token private project without max projects for user", function(done) {
          let project = Immutable.fromJS({
              id: 1,
              is_private: true
          });

          let user = Immutable.fromJS({
              max_private_projects: null,
              total_private_projects: 1,
              max_memberships_private_projects: 25
          });

          mocks.auth.refresh.promise().resolve();
          mocks.routeParams.token = "TOKEN";
          mocks.currentUserService.getUser.returns(user);
          mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();
          mocks.translate.instant.withArgs("ADMIN.PROJECT_TRANSFER.UNLIMITED_PROJECTS").returns("UNLIMITED_PROJECTS");

          let ctrl = $controller("TransferProjectController");
          ctrl.project = project;
          return ctrl.initialize().then(function() {
              expect(ctrl.ownerMessage).to.be.equal("ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PRIVATE");
              expect(ctrl.maxProjects).to.be.equal("UNLIMITED_PROJECTS");
              expect(ctrl.currentProjects).to.be.equal(1);
              return done();
          });
      });

    it("valid token public project with max projects for user", function(done) {
        let project = Immutable.fromJS({
            id: 1,
            is_public: true
        });

        let user = Immutable.fromJS({
            max_public_projects: 1,
            total_public_projects: 1,
            max_memberships_public_projects: 25
        });

        mocks.auth.refresh.promise().resolve();
        mocks.routeParams.token = "TOKEN";
        mocks.currentUserService.getUser.returns(user);
        mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();

        let ctrl = $controller("TransferProjectController");
        ctrl.project = project;
        return ctrl.initialize().then(function() {
            expect(ctrl.ownerMessage).to.be.equal("ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PUBLIC");
            expect(ctrl.maxProjects).to.be.equal(1);
            expect(ctrl.currentProjects).to.be.equal(1);
            return done();
        });
    });

    it("valid token public project without max projects for user", function(done) {
          let project = Immutable.fromJS({
              id: 1,
              is_public: true
          });

          let user = Immutable.fromJS({
              max_public_projects: null,
              total_public_projects: 1,
              max_memberships_public_projects: 25
          });

          mocks.auth.refresh.promise().resolve();
          mocks.routeParams.token = "TOKEN";
          mocks.currentUserService.getUser.returns(user);
          mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();
          mocks.translate.instant.withArgs("ADMIN.PROJECT_TRANSFER.UNLIMITED_PROJECTS").returns("UNLIMITED_PROJECTS");

          let ctrl = $controller("TransferProjectController");
          ctrl.project = project;
          return ctrl.initialize().then(function() {
              expect(ctrl.ownerMessage).to.be.equal("ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PUBLIC");
              expect(ctrl.maxProjects).to.be.equal("UNLIMITED_PROJECTS");
              expect(ctrl.currentProjects).to.be.equal(1);
              return done();
          });
      });

    it("transfer accept", function(done) {
          let project = Immutable.fromJS({
              id: 1,
              slug: "slug"
          });

          let user = Immutable.fromJS({});

          mocks.auth.refresh.promise().resolve();
          mocks.routeParams.token = "TOKEN";
          mocks.currentUserService.getUser.returns(user);
          mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();
          mocks.projectsService.transferAccept.withArgs(1, "TOKEN", "this is my reason").promise().resolve();
          mocks.tgNavUrls.resolve.withArgs("project-admin-project-profile-details", {project: "slug"}).returns("/project/slug/");
          mocks.translate.instant.withArgs("ADMIN.PROJECT_TRANSFER.ACCEPTED_PROJECT_OWNERNSHIP").returns("ACCEPTED_PROJECT_OWNERNSHIP");

          let ctrl = $controller("TransferProjectController");
          ctrl.project = project;
          return ctrl.initialize().then(() =>
              ctrl.transferAccept("TOKEN", "this is my reason").then(function() {
                  expect(mocks.location.path).to.be.calledWith("/project/slug/");
                  expect(mocks.tgConfirm.notify).to.be.calledWith("success", "ACCEPTED_PROJECT_OWNERNSHIP", '', 5000);

                  return done();
              })
          );
      });

    return it("transfer reject", function(done) {
          let project = Immutable.fromJS({
              id: 1,
              slug: "slug"
          });

          let user = Immutable.fromJS({});

          mocks.auth.refresh.promise().resolve();
          mocks.routeParams.token = "TOKEN";
          mocks.currentUserService.getUser.returns(user);
          mocks.projectsService.transferValidateToken.withArgs(1, "TOKEN").promise().resolve();
          mocks.projectsService.transferReject.withArgs(1, "TOKEN", "this is my reason").promise().resolve();
          mocks.tgNavUrls.resolve.withArgs("home", {project: "slug"}).returns("/project/slug/");
          mocks.translate.instant.withArgs("ADMIN.PROJECT_TRANSFER.REJECTED_PROJECT_OWNERNSHIP").returns("REJECTED_PROJECT_OWNERNSHIP");

          let ctrl = $controller("TransferProjectController");
          ctrl.project = project;
          return ctrl.initialize().then(() =>
              ctrl.transferReject("TOKEN", "this is my reason").then(function() {
                  expect(mocks.location.path).to.be.calledWith("/project/slug/");
                  expect(mocks.tgConfirm.notify).to.be.calledWith("success", "REJECTED_PROJECT_OWNERNSHIP", '', 5000);

                  return done();
              })
          );
      });
});
