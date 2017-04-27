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
 * File: profile-bar.controller.spec.coffee
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

describe("ProfileBar", function() {
    let $controller = null;
    let provide = null;
    let $rootScope = null;
    const mocks: any = {};

    const _mockUserService = function() {
        mocks.userService = {
            getStats:  sinon.stub(),
        };

        return provide.value("tgUserService", mocks.userService);
    };

    const _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockUserService();

            return null;
        })
    ;

    const _inject = (callback= null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    beforeEach(function() {
        module("taigaProfile");
        _mocks();
        return _inject();
    });

    return it("user stats filled", function(done) {
        const userId = 2;
        const stats = Immutable.fromJS([
            {id: 1},
            {id: 2},
            {id: 3},
        ]);

        mocks.userService.getStats.withArgs(userId).promise().resolve(stats);

        const $scope = $rootScope.$new;

        const ctrl = $controller("ProfileBar", $scope, {
            user: Immutable.fromJS({id: userId}),
        });

        return setTimeout(( function() {
            expect(ctrl.stats.toJS()).to.be.eql(stats.toJS());
            return done();
        }),
        );
    });
});
