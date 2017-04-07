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
 * File: wiki-history.controller.spec.coffee
 */

describe("WikiHistorySection", function() {
    let provide = null;
    let controller = null;
    let mocks = {};

    let _mockTgWikiHistoryService = function() {
        mocks.tgWikiHistoryService = {
            setWikiId: sinon.stub(),
            loadHistoryEntries: sinon.stub()
        };

        return provide.value("tgWikiHistoryService", mocks.tgWikiHistoryService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockTgWikiHistoryService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaWikiHistory");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("initialize histori entries with id", function() {
        let wikiId = 42;

        let historyCtrl = controller("WikiHistoryCtrl");
        historyCtrl.initializeHistoryEntries(wikiId);

        expect(mocks.tgWikiHistoryService.setWikiId).to.be.calledOnce;
        expect(mocks.tgWikiHistoryService.setWikiId).to.be.calledWith(wikiId);
        return expect(mocks.tgWikiHistoryService.loadHistoryEntries).to.be.calledOnce;
    });

    return it("initialize history entries without id",  function() {
        let historyCtrl = controller("WikiHistoryCtrl");
        historyCtrl.initializeHistoryEntries();

        expect(mocks.tgWikiHistoryService.setWikiId).to.not.be.calledOnce;
        return expect(mocks.tgWikiHistoryService.loadHistoryEntries).to.be.calledOnce;
    });
});
