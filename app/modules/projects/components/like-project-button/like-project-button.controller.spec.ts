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
 * File: like-project-button.controller.spec.coffee
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

describe("LikeProjectButton", function() {
    let $provide = null;
    let $controller = null;
    const mocks: any = {};

    const _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub(),
        };

        return $provide.value("$tgConfirm", mocks.tgConfirm);
    };

    const _mockTgLikeProjectButton = function() {
        mocks.tgLikeProjectButton = {
            like: sinon.stub(),
            unlike: sinon.stub(),
        };

        return $provide.value("tgLikeProjectButtonService", mocks.tgLikeProjectButton);
    };

    const _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockTgConfirm();
            _mockTgLikeProjectButton();

            return null;
        })
    ;

    const _inject = () =>
        inject((_$controller_) => $controller = _$controller_)
    ;

    const _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("toggleLike false -> true", function(done) {
        const project = Immutable.fromJS({
            id: 3,
            is_fan: false,
        });

        const ctrl = $controller("LikeProjectButton");
        ctrl.project = project;

        mocks.tgLikeProjectButton.like = (sinon.stub() as any).promise();

        const promise = ctrl.toggleLike();

        expect(ctrl.loading).to.be.true;

        mocks.tgLikeProjectButton.like.withArgs(project.get("id")).resolve();

        return promise.finally(function() {
            expect(mocks.tgLikeProjectButton.like).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    it("toggleLike false -> true, notify error", function(done) {
        const project = Immutable.fromJS({
            id: 3,
            is_fan: false,
        });

        const ctrl = $controller("LikeProjectButton");
        ctrl.project = project;

        mocks.tgLikeProjectButton.like.withArgs(project.get("id")).promise().reject(new Error("error"));

        return ctrl.toggleLike().finally(function() {
            expect(mocks.tgConfirm.notify.withArgs("error")).to.be.calledOnce;
            return done();
        });
    });

    it("toggleLike true -> false", function(done) {
        const project = Immutable.fromJS({
            is_fan: true,
        });

        const ctrl = $controller("LikeProjectButton");
        ctrl.project = project;

        mocks.tgLikeProjectButton.unlike = (sinon.stub() as any).promise();

        const promise = ctrl.toggleLike();

        expect(ctrl.loading).to.be.true;

        mocks.tgLikeProjectButton.unlike.withArgs(project.get("id")).resolve();

        return promise.finally(function() {
            expect(mocks.tgLikeProjectButton.unlike).to.be.calledOnce;
            expect(ctrl.loading).to.be.false;

            return done();
        });
    });

    return it("toggleLike true -> false, notify error", function(done) {
        const project = Immutable.fromJS({
            is_fan: true,
        });

        const ctrl = $controller("LikeProjectButton");
        ctrl.project = project;

        mocks.tgLikeProjectButton.unlike.withArgs(project.get("id")).promise().reject(new Error("error"));

        return ctrl.toggleLike().finally(function() {
            expect(mocks.tgConfirm.notify.withArgs("error")).to.be.calledOnce;
            return done();
        });
    });
});
