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
 * File:tag-line-common.controller.spec.coffee
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

describe("TagLineCommon", function() {
    let provide = null;
    let controller = null;
    let TagLineCommonCtrl = null;
    let mocks:any = {};

    let _mockTgTagLineService = function() {
        mocks.tgTagLineService = {
            checkPermissions: sinon.stub(),
            createColorsArray: sinon.stub(),
            renderTags: sinon.stub()
        };

        return provide.value("tgTagLineService", mocks.tgTagLineService);
    };


    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgTagLineService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");

        _mocks();

        inject($controller => controller = $controller);

        TagLineCommonCtrl = controller("TagLineCommonCtrl");
        TagLineCommonCtrl.tags = [];
        TagLineCommonCtrl.colorArray = [];
        return TagLineCommonCtrl.addTag = false;
    });

    it("check permissions", function() {
        TagLineCommonCtrl.project = {
        };
        TagLineCommonCtrl.project.my_permissions = [
            'permission1',
            'permission2'
        ];
        TagLineCommonCtrl.permissions = 'permissions1';

        TagLineCommonCtrl.checkPermissions();
        return expect(mocks.tgTagLineService.checkPermissions).have.been.calledWith(TagLineCommonCtrl.project.my_permissions, TagLineCommonCtrl.permissions);
    });

    it("create Colors Array", function() {
        let projectTagColors = 'string';
        mocks.tgTagLineService.createColorsArray.withArgs(projectTagColors).returns(true);
        TagLineCommonCtrl._createColorsArray(projectTagColors);
        return expect(TagLineCommonCtrl.colorArray).to.be.equal(true);
    });

    it("display tag input", function() {
        TagLineCommonCtrl.addTag = false;
        TagLineCommonCtrl.displayTagInput();
        return expect(TagLineCommonCtrl.addTag).to.be.true;
    });

    return it("on add tag", function() {
        TagLineCommonCtrl.loadingAddTag = true;
        let tag = 'tag1';
        let tags = ['tag1', 'tag2'];
        let color = "CC0000";

        TagLineCommonCtrl.project = {
            tags: ['tag1', 'tag2'],
            tags_colors: ["#CC0000", "CCBB00"]
        };

        TagLineCommonCtrl.onAddTag = sinon.spy();
        TagLineCommonCtrl.newTag = {name: "11", color: "22"};

        TagLineCommonCtrl.addNewTag(tag, color);

        expect(TagLineCommonCtrl.onAddTag).have.been.calledWith({name: tag, color});
        expect(TagLineCommonCtrl.newTag.name).to.be.eql("");
        return expect(TagLineCommonCtrl.newTag.color).to.be.null;
    });
});
