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
 * File: import-project.service.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("tgImportProjectService", function() {
    let $provide = null;
    let importProjectService = null;
    let mocks:any = {};

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            loadProjects: sinon.stub(),
            getUser: sinon.stub(),
            canCreatePrivateProjects: sinon.stub(),
            canCreatePublicProjects: sinon.stub()
        };

        return $provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockAuth = function() {
        mocks.auth = {
            refresh: sinon.stub()
        };

        return $provide.value("$tgAuth", mocks.auth);
    };

    let _mockLightboxFactory = function() {
        mocks.lightboxFactory = {
            create: sinon.stub()
        };

        return $provide.value("tgLightboxFactory", mocks.lightboxFactory);
    };

    let _mockTranslate = function() {
        mocks.translate = {
            instant: sinon.stub()
        };

        return $provide.value("$translate", mocks.translate);
    };

    let _mockConfirm = function() {
        mocks.confirm = {
            success: sinon.stub(),
            notify: sinon.stub()
        };

        return $provide.value("$tgConfirm", mocks.confirm);
    };

    let _mockLocation = function() {
        mocks.location = {
            path: sinon.stub()
        };

        return $provide.value("$location", mocks.location);
    };

    let _mockNavUrls = function() {
        mocks.navUrls = {
            resolve: sinon.stub()
        };

        return $provide.value("$tgNavUrls", mocks.navUrls);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockCurrentUserService();
            _mockAuth();
            _mockLightboxFactory();
            _mockTranslate();
            _mockConfirm();
            _mockLocation();
            _mockNavUrls();

            return null;
        })
    ;

    let _inject = () =>
        inject(_tgImportProjectService_ => importProjectService = _tgImportProjectService_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("import success async mode", function(done) {
        let result = {
            status: 202,
            data: {
                slug: 'project-slug'
            }
        };

        mocks.translate.instant.returns('xxx');

        mocks.currentUserService.loadProjects.promise().resolve();

        return importProjectService.importSuccess(result).then(function() {
            expect(mocks.confirm.success).have.been.calledOnce;
            return done();
        });
    });

    it("import success sync mode", function(done) {
        let result = {
            status: 201,
            data: {
                slug: 'project-slug'
            }
        };

        mocks.translate.instant.returns('msg');

        mocks.navUrls.resolve.withArgs('project-admin-project-profile-details', {project: 'project-slug'}).returns('url');

        mocks.currentUserService.loadProjects.promise().resolve();

        return importProjectService.importSuccess(result).then(function() {
            expect(mocks.location.path).have.been.calledWith('url');
            expect(mocks.confirm.notify).have.been.calledWith('success', 'msg');
            return done();
        });
    });

    it("private get restriction errors, private & member error", function() {
        let result = {
            headers: {
                isPrivate: true,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_private_projects: 1
        }));

        mocks.currentUserService.canCreatePrivateProjects.returns({
            valid: false
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'private-space-members',
            values: {
                max_memberships: 1,
                members: 10
            }
        });
    });

    it("private get restriction errors, private limit error", function() {
        let result = {
            headers: {
                isPrivate: true,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_private_projects: 20
        }));

        mocks.currentUserService.canCreatePrivateProjects.returns({
            valid: false
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'private-space',
            values: {
                max_memberships: null,
                members: 10
            }
        });
    });

    it("private get restriction errors, members error", function() {
        let result = {
            headers: {
                isPrivate: true,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_private_projects: 1
        }));

        mocks.currentUserService.canCreatePrivateProjects.returns({
            valid: true
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'private-members',
            values: {
                max_memberships: 1,
                members: 10
            }
        });
    });

    it("public get restriction errors, public & member error", function() {
        let result = {
            headers: {
                isPrivate: false,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_public_projects: 1
        }));

        mocks.currentUserService.canCreatePublicProjects.returns({
            valid: false
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'public-space-members',
            values: {
                max_memberships: 1,
                members: 10
            }
        });
    });

    it("public get restriction errors, public limit error", function() {
        let result = {
            headers: {
                isPrivate: false,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_public_projects: 20
        }));

        mocks.currentUserService.canCreatePublicProjects.returns({
            valid: false
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'public-space',
            values: {
                max_memberships: null,
                members: 10
            }
        });
    });

    return it("public get restriction errors, members error", function() {
        let result = {
            headers: {
                isPrivate: false,
                memberships: 10
            }
        };

        mocks.currentUserService.getUser.returns(Immutable.fromJS({
            max_memberships_public_projects: 1
        }));

        mocks.currentUserService.canCreatePublicProjects.returns({
            valid: true
        });

        let error = importProjectService.getRestrictionError(result);

        return expect(error).to.be.eql({
            key: 'public-members',
            values: {
                max_memberships: 1,
                members: 10
            }
        });
    });
});
