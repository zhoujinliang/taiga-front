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
 * File: subscriptions.controller.spec.coffee
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

describe("ActivitiesDiffController", function() {
    let provide = null;
    let controller = null;
    let mocks:any = {};

    beforeEach(function() {
        module("taigaHistory");

        return inject($controller => controller = $controller);
    });

    return it("Check diff between tags", function() {
        let activitiesDiffCtrl = controller("ActivitiesDiffCtrl");

        activitiesDiffCtrl.type = "tags";

        activitiesDiffCtrl.diff = [
            ["architecto", "perspiciatis", "testafo"],
            ["architecto", "perspiciatis", "testafo", "fasto"]
        ];

        activitiesDiffCtrl.diffTags();
        expect(activitiesDiffCtrl.diffRemoveTags).to.be.equal('');
        return expect(activitiesDiffCtrl.diffAddTags).to.be.equal('fasto');
    });
});
