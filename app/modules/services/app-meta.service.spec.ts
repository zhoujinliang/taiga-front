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
 * File: app-meta.service.spec.coffee
 */

angular.module("taigaCommon").provider("$exceptionHandler", angular.mock.$ExceptionHandlerProvider);

describe("AppMetaService", function() {
    let appMetaService = null;
    let $rootScope = null;
    let data = {
        title: "--title--",
        description: "--description--"
    };

    let _inject = () =>
        inject(function(_tgAppMetaService_, _$rootScope_) {
            appMetaService = _tgAppMetaService_;
            return $rootScope = _$rootScope_;
        })
    ;

    before(() => window._version = 1);

    beforeEach(function() {
        module("taigaCommon");
        return _inject();
    });

    it("set meta title", function() {
        appMetaService.setTitle(data.title);
        return expect($("title")).to.have.text(data.title);
    });

    it("set meta description", function() {
        appMetaService.setDescription(data.description);
        return expect($("meta[name='description']")).to.have.attr("content", data.description);
    });

    it("set meta for twitter", function() {
        appMetaService.setTwitterMetas(data.title, data.description);
        expect($("meta[name='twitter:card']")).to.have.attr("content",  "summary");
        expect($("meta[name='twitter:site']")).to.have.attr("content",  "@taigaio");
        expect($("meta[name='twitter:title']")).to.have.attr("content",  data.title);
        expect($("meta[name='twitter:description']")).to.have.attr("content",  data.description);
        return expect($("meta[name='twitter:image']")).to.have.attr("content",  `${window.location.origin}/${window._version}/images/logo-color.png`);
    });

    it("set meta for open graph", function() {
        appMetaService.setOpenGraphMetas(data.title, data.description);
        expect($("meta[property='og:type']")).to.have.attr("content", "object");
        expect($("meta[property='og:site_name']")).to.have.attr("content", "Taiga - Love your projects");
        expect($("meta[property='og:title']")).to.have.attr("content", data.title);
        expect($("meta[property='og:description']")).to.have.attr("content", data.description);
        expect($("meta[property='og:image']")).to.have.attr("content", `${window.location.origin}/${window._version}/images/logo-color.png`);
        return expect($("meta[property='og:url']")).to.have.attr("content", window.location.href);
    });

    it("set all meta", function() {
        appMetaService.setAll(data.title, data.description);
        expect($("title")).to.have.text(data.title);
        expect($("meta[name='description']")).to.have.attr("content", data.description);
        expect($("meta[name='twitter:card']")).to.have.attr("content",  "summary");
        expect($("meta[name='twitter:site']")).to.have.attr("content",  "@taigaio");
        expect($("meta[name='twitter:title']")).to.have.attr("content",  data.title);
        expect($("meta[name='twitter:description']")).to.have.attr("content",  data.description);
        expect($("meta[name='twitter:image']")).to.have.attr("content",  `${window.location.origin}/${window._version}/images/logo-color.png`);
        expect($("meta[property='og:type']")).to.have.attr("content", "object");
        expect($("meta[property='og:site_name']")).to.have.attr("content", "Taiga - Love your projects");
        expect($("meta[property='og:title']")).to.have.attr("content", data.title);
        expect($("meta[property='og:description']")).to.have.attr("content", data.description);
        expect($("meta[property='og:image']")).to.have.attr("content", `${window.location.origin}/${window._version}/images/logo-color.png`);
        return expect($("meta[property='og:url']")).to.have.attr("content", window.location.href);
    });

    return it("set function to set the metas", function() {
        let fn = () =>
            ({
                title: 'test',
                description: 'test2'
            })
        ;


        appMetaService.setAll = sinon.stub();
        appMetaService.setfn(fn);

        $rootScope.$digest();

        return expect(appMetaService.setAll).to.have.been.calledWith('test', 'test2');
    });
});
