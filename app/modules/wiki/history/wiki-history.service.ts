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
 * File: wiki-history.service.coffee
 */

let { taiga } = this;

let module = angular.module('taigaWikiHistory');

class WikiHistoryService extends taiga.Service {
    static initClass() {
        this.$inject = [
            "tgResources",
            "tgXhrErrorService"
        ];
        _;
    }

    constructor(rs, xhrError) {
        this.rs = rs;
        this.xhrError = xhrError;
        this._wikiId = null;
        this._historyEntries = Immutable.List();

        taiga.defineImmutableProperty(this, "wikiId", () => { return this._wikiId; });
        taiga.defineImmutableProperty(this, "historyEntries", () => { return this._historyEntries; });
    }

    setWikiId(wikiId) {
        this._wikiId = wikiId;
        return this._historyEntries = Immutable.List();
    }

    loadHistoryEntries() {
        if (!this._wikiId) { return; }

        return this.rs.wikiHistory.getWikiHistory(this._wikiId)
            .then(historyEntries => {
                if (historyEntries.size) {
                    return this._historyEntries = historyEntries.reverse();
                }
        }).catch(xhr => {
                return this.xhrError.response(xhr);
        });
    }
}
WikiHistoryService.initClass();
module.service("tgWikiHistoryService", WikiHistoryService);
