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
 * File: watch-project-button.controller.spec.coffee
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

describe("WatchProjectButton", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };

        return $provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgWatchProjectButton = function() {
        mocks.tgWatchProjectButton = {
            watch: sinon.stub(),
            unwatch: sinon.stub()
        };

        return $provide.value("tgWatchProjectButtonService", mocks.tgWatchProjectButton);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockTgConfirm();
            _mockTgWatchProjectButton();

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

    it("toggleWatcherOption", function() {
        let ctrl = $controller("WatchProjectButton");

        ctrl.toggleWatcherOptions();

        expect(ctrl.showWatchOptions).to.be.true;

        ctrl.toggleWatcherOptions();

        return expect(ctrl.showWatchOptions).to.be.false;
    });

    it("watch", function(done) {
        let notifyLevel = 5;
        let project = Immutable.fromJS({
            id: 3
        });

        let ctrl = $controller("WatchProjectButton");
        ctrl.project = project;
        ctrl.showWatchOptions = true;

        mocks.tgWatchProjectButton.watch = (<any>sinon.stub()).promise();

        let promise = ctrl.watch(notifyLevel);

        expect(ctrl.loading).to.be.true;

        mocks.tgWatchProjectButton.watch.withArgs(project.get('id'), notifyLevel).resolve();

        return promise.finally(function() {
            expect(mocks.tgWatchProjectButton.watch).to.be.calledOnce;
            expect(ctrl.showWatchOptions).to.be.false;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    it("watch the same option", function() {
        let notifyLevel = 5;
        let project = Immutable.fromJS({
            id: 3,
            notify_level: 5
        });

        let ctrl = $controller("WatchProjectButton");
        ctrl.project = project;

        let result = ctrl.watch(notifyLevel);
        return expect(result).to.be.falsy;
    });

    it("watch, notify error", function(done) {
        let notifyLevel = 5;
        let project = Immutable.fromJS({
            id: 3
        });

        let ctrl = $controller("WatchProjectButton");
        ctrl.project = project;
        ctrl.showWatchOptions = true;

        mocks.tgWatchProjectButton.watch.withArgs(project.get('id'), notifyLevel).promise().reject(new Error('error'));

        return ctrl.watch(notifyLevel).finally(function() {
            expect(mocks.tgConfirm.notify.withArgs("error")).to.be.calledOnce;
            expect(ctrl.showWatchOptions).to.be.false;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    it("unwatch", function(done) {
        let project = Immutable.fromJS({
            id: 3
        });

        let ctrl = $controller("WatchProjectButton");
        ctrl.project = project;
        ctrl.showWatchOptions = true;

        mocks.tgWatchProjectButton.unwatch = (<any>sinon.stub()).promise();

        let promise = ctrl.unwatch();

        expect(ctrl.loading).to.be.true;

        mocks.tgWatchProjectButton.unwatch.withArgs(project.get('id')).resolve();

        return promise.finally(function() {
            expect(mocks.tgWatchProjectButton.unwatch).to.be.calledOnce;
            expect(ctrl.showWatchOptions).to.be.false;

            return done();
        });
    });

    return it("unwatch, notify error", function(done) {
        let project = Immutable.fromJS({
            id: 3
        });

        let ctrl = $controller("WatchProjectButton");
        ctrl.project = project;
        ctrl.showWatchOptions = true;

        mocks.tgWatchProjectButton.unwatch.withArgs(project.get('id')).promise().reject(new Error('error'));

        return ctrl.unwatch().finally(function() {
            expect(mocks.tgConfirm.notify.withArgs("error")).to.be.calledOnce;
            expect(ctrl.showWatchOptions).to.be.false;

            return done();
        });
    });
});
