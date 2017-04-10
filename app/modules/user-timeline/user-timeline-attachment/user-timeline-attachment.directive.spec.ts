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
 * File: user-timeline-attachment.directive.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("userTimelineAttachmentDirective", function() {
    let compile, provide, scope;
    let element = (scope = (compile = (provide = null)));
    let mockTgTemplate = null;
    let template = "<div tg-user-timeline-attachment='attachment'></div>";

    let _mockTgTemplate= function() {
        mockTgTemplate = {
            get: sinon.stub()
        };

        return provide.value("$tgTemplate", mockTgTemplate);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgTemplate();

            return null;
        })
    ;

    let createDirective = function() {
        let elm = compile(template)(scope);

        return elm;
    };

    beforeEach(function() {
        module("taigaUserTimeline");

        _mocks();

        return inject(function($rootScope, $compile) {
            scope = $rootScope.$new();
            return compile = $compile;
        });
    });

    it("attachment image template", function() {
        scope.attachment =  Immutable.fromJS({
            url: "path/path/file.jpg"
        });

        mockTgTemplate.get
            .withArgs("user-timeline/user-timeline-attachment/user-timeline-attachment-image.html")
            .returns("<div id='image'></div>");

        let elm = createDirective();

        return expect(elm.find('#image')).to.have.length(1);
    });

    return it("attachment file template", function() {
        scope.attachment =  Immutable.fromJS({
            url: "path/path/file.pdf"
        });

        mockTgTemplate.get
            .withArgs("user-timeline/user-timeline-attachment/user-timeline-attachment.html")
            .returns("<div id='file'></div>");

        let elm = createDirective();

        return expect(elm.find('#file')).to.have.length(1);
    });
});
