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
 * File: check-permissions.service.spec.coffee
 */

describe("tgCheckPermissionsService", function() {
    let provide;
    let checkPermissionsService = (provide = null);
    let mocks = {};

    let _mockProjectService = function() {
        mocks.projectService = {
            project: sinon.stub()
        };

        return provide.value("tgProjectService", mocks.projectService);
    };

    let _inject = () =>
        inject(_tgCheckPermissionsService_ => checkPermissionsService = _tgCheckPermissionsService_)
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockProjectService();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");
        _mocks();
        return _inject();
    });

    it("the user has perms", function() {
        mocks.projectService.project = Immutable.fromJS({
            my_permissions: ['add_us']
        });

        let perm = checkPermissionsService.check('add_us');

        return expect(perm).to.be.true;
    });

    return it("the user hasn't perms", function() {
        mocks.projectService.project = Immutable.fromJS({
            my_permissions: []
        });

        let perm = checkPermissionsService.check('add_us');

        return expect(perm).to.be.false;
    });
});
