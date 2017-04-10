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
 * File: user.service.spec.coffee
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

describe("UserService", function() {
    let userService = null;
    let $q = null;
    let provide = null;
    let $rootScope = null;
    let mocks:any = {};

    let _mockResources = function() {
        mocks.resources = {};
        mocks.resources.users = {
            getProjects: sinon.stub(),
            getContacts: sinon.stub()
        };

        return provide.value("tgResources", mocks.resources);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockResources();

            return null;
        })
    ;

    let _inject = (callback=null) =>
        inject(function(_tgUserService_, _$q_, _$rootScope_) {
            userService = _tgUserService_;
            $q = _$q_;
            return $rootScope = _$rootScope_;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");
        _mocks();
        return _inject();
    });

    it("attach user contacts to projects", function(done) {
        let userId = 2;

        let projects = Immutable.fromJS([
            {id: 1, members: [1, 2, 3]},
            {id: 2, members: [2, 3]},
            {id: 3, members: [1]}
        ]);

        let contacts = Immutable.fromJS([
            {id: 1, name: "fake1"},
            {id: 2, name: "fake2"},
            {id: 3, name: "fake3"}
        ]);

        mocks.resources.users.getContacts = sinon.stub();
        mocks.resources.users.getContacts.withArgs(userId).promise().resolve(contacts);

        return userService.attachUserContactsToProjects(userId, projects).then(function(_projects_) {
            contacts = _projects_.get(0).get("contacts");

            expect(contacts.get(0).get("name")).to.be.equal('fake1');

            return done();
        });
    });

    it("get user contacts", function(done) {
        let userId = 2;

        let contacts = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        mocks.resources.users.getContacts = sinon.stub();
        mocks.resources.users.getContacts.withArgs(userId).promise().resolve(contacts);

        userService.getContacts(userId).then(function(_contacts_) {
            expect(_contacts_).to.be.eql(contacts);
            return done();
        });

        return $rootScope.$apply();
    });

    it("get user liked", function(done) {
        let userId = 2;
        let pageNumber = 1;
        let objectType = null;
        let textQuery = null;

        let liked = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        mocks.resources.users.getLiked = sinon.stub();
        mocks.resources.users.getLiked.withArgs(userId, pageNumber, objectType, textQuery)
                                      .promise()
                                      .resolve(liked);

        userService.getLiked(userId, pageNumber, objectType, textQuery).then(function(_liked_) {
            expect(_liked_).to.be.eql(liked);
            return done();
        });

        return $rootScope.$apply();
    });

    it("get user voted", function(done) {
        let userId = 2;
        let pageNumber = 1;
        let objectType = null;
        let textQuery = null;

        let voted = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        mocks.resources.users.getVoted = sinon.stub();
        mocks.resources.users.getVoted.withArgs(userId, pageNumber, objectType, textQuery)
                                      .promise()
                                      .resolve(voted);

        userService.getVoted(userId, pageNumber, objectType, textQuery).then(function(_voted_) {
            expect(_voted_).to.be.eql(voted);
            return done();
        });

        return $rootScope.$apply();
    });

    it("get user watched", function(done) {
        let userId = 2;
        let pageNumber = 1;
        let objectType = null;
        let textQuery = null;

        let watched = [
            {id: 1},
            {id: 2},
            {id: 3}
        ];

        mocks.resources.users.getWatched = sinon.stub();
        mocks.resources.users.getWatched.withArgs(userId, pageNumber, objectType, textQuery)
                                        .promise()
                                        .resolve(watched);

        userService.getWatched(userId, pageNumber, objectType, textQuery).then(function(_watched_) {
            expect(_watched_).to.be.eql(watched);
            return done();
        });

        return $rootScope.$apply();
    });

    return it("get user by username", function(done) {
        let username = "username-1";

        let user = {id: 1};

        mocks.resources.users.getUserByUsername = sinon.stub();
        mocks.resources.users.getUserByUsername.withArgs(username).promise().resolve(user);

        return userService.getUserByUserName(username).then(function(_user_) {
            expect(_user_).to.be.eql(user);
            return done();
        });
    });
});
