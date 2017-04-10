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
 * File: import-project.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("ImportProjectCtrl", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockConfig = function() {
        mocks.config = Immutable.fromJS({
            importers: ['trello', 'github', 'jira', 'asana']
        });

        return $provide.value("$tgConfig", mocks.config);
    };

    let _mockTrelloImportService = function() {
        mocks.trelloService = {
            authorize: sinon.stub(),
            getAuthUrl: sinon.stub()
        };

        return $provide.value("tgTrelloImportService", mocks.trelloService);
    };

    let _mockJiraImportService = function() {
        mocks.jiraService = {
            authorize: sinon.stub(),
            getAuthUrl: sinon.stub()
        };

        return $provide.value("tgJiraImportService", mocks.jiraService);
    };

    let _mockGithubImportService = function() {
        mocks.githubService = {
            authorize: sinon.stub(),
            getAuthUrl: sinon.stub()
        };

        return $provide.value("tgGithubImportService", mocks.githubService);
    };

    let _mockAsanaImportService = function() {
        mocks.asanaService = {
            authorize: sinon.stub(),
            getAuthUrl: sinon.stub()
        };

        return $provide.value("tgAsanaImportService", mocks.asanaService);
    };

    let _mockWindow = function() {
        mocks.window = {
            open: sinon.stub()
        };

        return $provide.value("$window", mocks.window);
    };

    let _mockConfirm = function() {
        mocks.confirm = {
            notify: sinon.stub()
        };

        return $provide.value("$tgConfirm", mocks.confirm);
    };

    let _mockLocation = function() {
        mocks.location = {
            search: sinon.stub()
        };

        return $provide.value("$location", mocks.location);
    };

    let _mockRouteParams = function() {
        mocks.routeParams = {
            platform: null
        };

        return $provide.value("$routeParams", mocks.routeParams);
    };

    let _mockTgNavUrls = function() {
        mocks.tgNavUrls = {
            resolve: sinon.stub()
        };

        return $provide.value("$tgNavUrls", mocks.tgNavUrls);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockGithubImportService();
            _mockTrelloImportService();
            _mockJiraImportService();
            _mockAsanaImportService();
            _mockWindow();
            _mockConfirm();
            _mockLocation();
            _mockTgNavUrls();
            _mockRouteParams();
            _mockConfig();

            return null;
        })
    ;

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("initialize form with trello", function(done) {
        let searchResult = {
            oauth_verifier: 123,
            token: "token"
        };

        mocks.location.search.returns(searchResult);
        mocks.trelloService.authorize.withArgs(123).promise().resolve("token2");

        let ctrl = $controller("ImportProjectCtrl");

        mocks.routeParams.platform = 'trello';

        return ctrl.start().then(function() {
            expect(mocks.location.search).have.been.calledWith({token: "token2"});

            return done();
        });
    });

    it("initialize form with github", function(done) {
        let searchResult = {
            code: 123,
            token: "token",
            from: "github"
        };

        mocks.location.search.returns(searchResult);
        mocks.githubService.authorize.withArgs(123).promise().resolve("token2");

        let ctrl = $controller("ImportProjectCtrl");

        mocks.routeParams.platform = 'github';

        return ctrl.start().then(function() {
            expect(mocks.location.search).have.been.calledWith({token: "token2"});

            return done();
        });
    });

    it("initialize form with asana", function(done) {
        let searchResult = {
            code: 123,
            token: encodeURIComponent("{\"token\": 222}"),
            from: "asana"
        };

        mocks.location.search.returns(searchResult);
        mocks.asanaService.authorize.withArgs(123).promise().resolve("token2");

        let ctrl = $controller("ImportProjectCtrl");

        mocks.routeParams.platform = 'asana';

        return ctrl.start().then(function() {
            expect(mocks.location.search).have.been.calledWith({token: encodeURIComponent(JSON.stringify("token2"))});

            return done();
        });
    });

    return it("select trello import", function() {
        let ctrl = $controller("ImportProjectCtrl");

        mocks.trelloService.getAuthUrl.promise().resolve("url");

        return ctrl.select("trello").then(() => expect(mocks.window.open).have.been.calledWith("url", "_self"));
    });
});
