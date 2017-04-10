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
 * File: story-row.controller.spec.coffee
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

describe("StoryRowCtrl", function() {
    let controller = null;

    beforeEach(function() {
        module("taigaEpics");

        return inject($controller => controller = $controller);
    });

    it("calculate percentage for some closed tasks", function() {
        let data = {
            story: Immutable.fromJS({
                tasks: [
                    {is_closed: true},
                    {is_closed: true},
                    {is_closed: true},
                    {is_closed: false},
                    {is_closed: false},
                ]
            })
        };

        let ctrl = controller("StoryRowCtrl", null, data);
        return expect(ctrl.percentage).to.be.equal("60%");
    });

    it("calculate percentage for closed story", function() {
        let data = {
            story: Immutable.fromJS({
                tasks: [
                    {is_closed: true},
                    {is_closed: true},
                    {is_closed: true},
                    {is_closed: false},
                    {is_closed: false},
                ],
                is_closed: true
            })
        };

        let ctrl = controller("StoryRowCtrl", null, data);
        return expect(ctrl.percentage).to.be.equal("100%");
    });

    return it("calculate percentage for closed story", function() {
        let data = {
            story: Immutable.fromJS({
                tasks: []
            })
        };

        let ctrl = controller("StoryRowCtrl", null, data);
        return expect(ctrl.percentage).to.be.equal("0%");
    });
});

