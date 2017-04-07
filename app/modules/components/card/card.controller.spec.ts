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
 * File: card.controller.spec.coffee
 */

describe("Card", function() {
    let $provide = null;
    let $controller = null;
    let mocks = {};

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _setup = () => _inject();

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("toggle fold callback", function() {
        let ctrl = $controller("Card");

        ctrl.item = Immutable.fromJS({id: 2});
        ctrl.onToggleFold = sinon.spy();

        ctrl.toggleFold();

        return expect(ctrl.onToggleFold).to.have.been.calledWith({id: 2});
    });

    it("get closed tasks", function() {
        let ctrl = $controller("Card");

        ctrl.item = Immutable.fromJS({
            id: 2,
            model: {
                tasks: [
                    {is_closed: true},
                    {is_closed: false},
                    {is_closed: true}
                ]
            }
        });

        let tasks = ctrl.getClosedTasks();
        return expect(tasks.size).to.be.equal(2);
    });

    it("get closed percent", function() {
        let ctrl = $controller("Card");

        ctrl.item = Immutable.fromJS({
            id: 2,
            model: {
                tasks: [
                    {is_closed: true},
                    {is_closed: false},
                    {is_closed: false},
                    {is_closed: true}
                ]
            }
        });

        let percent = ctrl.closedTasksPercent();
        return expect(percent).to.be.equal(50);
    });

    return describe("check if related task and slides visibility", function() {
        it("no content", function() {
            let ctrl = $controller("Card");

            ctrl.item = Immutable.fromJS({
                id: 2,
                images: [],
                model: {
                    tasks: []
                }
            });

            ctrl.visible = () => { return true; };

            let visibility = ctrl._setVisibility();

            return expect(visibility).to.be.eql({
                related: false,
                slides: false
            });
        });

        it("with content", function() {
            let ctrl = $controller("Card");

            ctrl.item = Immutable.fromJS({
                id: 2,
                images: [3,4],
                model: {
                    tasks: [1,2]
                }
            });

            ctrl.visible = () => { return true; };

            let visibility = ctrl._setVisibility();

            return expect(visibility).to.be.eql({
                related: true,
                slides: true
            });
        });

        return it("fold", function() {
            let ctrl = $controller("Card");

            ctrl.item = Immutable.fromJS({
                foldStatusChanged: true,
                id: 2,
                images: [3,4],
                model: {
                    tasks: [1,2]
                }
            });

            ctrl.visible = () => { return true; };

            let visibility = ctrl._setVisibility();

            return expect(visibility).to.be.eql({
                related: false,
                slides: false
            });
        });
    });
});
