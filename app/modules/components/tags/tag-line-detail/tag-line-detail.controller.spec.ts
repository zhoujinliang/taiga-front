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
 * File:tag-line-detail.controller.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
declare var sinon:any;

describe("TagLineDetail", function() {
    let provide = null;
    let controller = null;
    let TagLineController = null;
    let mocks:any = {};

    let _mockRootScope = function() {
        mocks.rootScope = {
            $broadcast: sinon.stub()
        };

        return provide.value("$rootScope", mocks.rootScope);
    };

    let _mockTgConfirm = function() {
        mocks.tgConfirm = {
            notify: sinon.stub()
        };

        return provide.value("$tgConfirm", mocks.tgConfirm);
    };

    let _mockTgQueueModelTransformation = function() {
        mocks.tgQueueModelTransformation = {
            save: sinon.stub()
        };

        return provide.value("$tgQueueModelTransformation", mocks.tgQueueModelTransformation);
    };


    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockRootScope();
            _mockTgConfirm();
            _mockTgQueueModelTransformation();

            return null;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");
        module("taigaComponents");

        _mocks();

        inject($controller => controller = $controller);

        return TagLineController = controller("TagLineCtrl");
    });

    it("on delete tag success", function(done) {
        let tag = {
            name: 'tag1'
        };
        let tagName = tag.name;

        let item = {
            tags: [
                ['tag1'],
                ['tag2'],
                ['tag3']
            ]
        };

        mocks.tgQueueModelTransformation.save.callsArgWith(0, item);
        mocks.tgQueueModelTransformation.save.promise().resolve(item);

        return TagLineController.onDeleteTag(['tag1', '#000']).then(function(item) {
            expect(item.tags).to.be.eql([
                ['tag2'],
                ['tag3']
            ]);
            expect(TagLineController.loadingRemoveTag).to.be.false;
            expect(mocks.rootScope.$broadcast).to.be.calledWith("object:updated");
            return done();
        });
    });

    it("on delete tag error", function(done) {
        mocks.tgQueueModelTransformation.save.promise().reject(new Error('error'));

        return TagLineController.onDeleteTag(['tag1']).finally(function() {
            expect(TagLineController.loadingRemoveTag).to.be.false;
            expect(mocks.tgConfirm.notify).to.be.calledWith("error");
            return done();
        });
    });

    it("on add tag success", function(done) {
        let tag = 'tag1';
        let tagColor = '#eee';

        let item = {
            tags: [
                ['tag2'],
                ['tag3']
            ]
        };

        let mockPromise = mocks.tgQueueModelTransformation.save.promise();

        mocks.tgQueueModelTransformation.save.callsArgWith(0, item);
        let promise = TagLineController.onAddTag(tag, tagColor);

        expect(TagLineController.loadingAddTag).to.be.true;

        mockPromise.resolve(item);

        return promise.then(function(item) {
            expect(item.tags).to.be.eql([
                ['tag2'],
                ['tag3'],
                ['tag1', '#eee']
            ]);

            expect(mocks.rootScope.$broadcast).to.be.calledWith("object:updated");
            expect(TagLineController.addTag).to.be.false;
            expect(TagLineController.loadingAddTag).to.be.false;

            return done();
        });
    });

    return it("on add tag error", function(done) {
        let tag = 'tag1';
        let tagColor = '#eee';

        let item = {
            tags: [
                ['tag2'],
                ['tag3']
            ]
        };

        let mockPromise = mocks.tgQueueModelTransformation.save.promise();

        mocks.tgQueueModelTransformation.save.callsArgWith(0, item);
        let promise = TagLineController.onAddTag(tag, tagColor);

        expect(TagLineController.loadingAddTag).to.be.true;

        mockPromise.reject(new Error('error'));

        return promise.then(function(item) {
            expect(TagLineController.loadingAddTag).to.be.false;
            expect(mocks.tgConfirm.notify).to.be.calledWith("error");
            return done();
        });
    });
});
