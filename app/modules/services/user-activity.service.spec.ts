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
 * File: app-meta.service.spec.coffee
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

angular.module("taigaCommon").provider("$exceptionHandler", angular.mock.$ExceptionHandlerProvider);

describe("UserActivityService", function() {
    let userActivityService = null;
    let $timeout = null;

    let _inject = () =>
        inject(function(_tgUserActivityService_, _$timeout_) {
            userActivityService = _tgUserActivityService_;
            return $timeout = _$timeout_;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");
        return _inject();
    });

    it("inactive", function(done) {
        let active = sinon.spy();
        userActivityService.onInactive(function() {
            expect(active).not.to.have.been.called;
            return done();
        });

        userActivityService.onActive(active);

        return $timeout.flush();
    });

    it("unsubscribe inactive", function(done) {
        var unsubscribe = userActivityService.onInactive(function() {
            unsubscribe();

            expect(userActivityService.subscriptionsInactive).to.have.length(0);

            return done();
        });

        expect(userActivityService.subscriptionsInactive).to.have.length(1);

        return $timeout.flush();
    });

    it("active", function(done) {
        let inactive = sinon.spy();
        userActivityService.onInactive(inactive);

        userActivityService.onActive(function() {
            expect(inactive).to.have.been.called;
            return done();
        });

        $timeout.flush();
        return userActivityService.resetTimer();
    });

    return it("unsubscribe active", function(done) {
        var unsubscribe = userActivityService.onActive(function() {
            unsubscribe();

            expect(userActivityService.subscriptionsActive).to.have.length(0);

            return done();
        });

        expect(userActivityService.subscriptionsActive).to.have.length(1);

        $timeout.flush();
        return userActivityService.resetTimer();
    });
});
