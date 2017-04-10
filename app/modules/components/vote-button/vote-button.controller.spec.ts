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
 * File: vote-button.controller.spec.coffee
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

describe("VoteButton", function() {
    let provide = null;
    let $controller = null;
    let $rootScope = null;
    let mocks:any = {};

    let _mockCurrentUser = function() {
        mocks.currentUser = {
            getUser: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUser);
    };

    let _mocks = function() {
        mocks = {
            onUpvote: sinon.stub(),
            onDownvote: sinon.stub()
        };

        return module(function($provide) {
            provide = $provide;
            _mockCurrentUser();
            return null;
        });
    };

    let _inject = (callback=null) =>
        inject(function(_$controller_, _$rootScope_) {
            $rootScope = _$rootScope_;
            return $controller = _$controller_;
        })
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");
        return _setup();
    });

    it("upvote", function(done) {
        let $scope = $rootScope.$new();

        mocks.onUpvote = (<any>sinon.stub()).promise();

        let ctrl = $controller("VoteButton", $scope, {
            item: {is_voter: false},
            onUpvote: mocks.onUpvote,
            onDownvote: mocks.onDownvote
        });

        let promise = ctrl.toggleVote();

        expect(ctrl.loading).to.be.true;

        mocks.onUpvote.resolve();

        return promise.finally(function() {
            expect(mocks.onUpvote).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    return it("downvote", function(done) {
        let $scope = $rootScope.$new();

        mocks.onDownvote = (<any>sinon.stub()).promise();

        let ctrl = $controller("VoteButton", $scope, {
            item: {is_voter: true},
            onUpvote: mocks.onUpvote,
            onDownvote: mocks.onDownvote
        });

        let promise = ctrl.toggleVote();

        expect(ctrl.loading).to.be.true;

        mocks.onDownvote.resolve();

        return promise.finally(function() {
            expect(mocks.onDownvote).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });
});
