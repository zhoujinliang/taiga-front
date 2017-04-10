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
 * File: theme.service.spec.coffee
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

describe("ThemeService", function() {
    let themeService = null;
    let data = {
        theme: "testTheme"
    };

    let _inject = () =>
        inject(_tgThemeService_ => themeService = _tgThemeService_)
    ;

    beforeEach(function() {
        module("taigaCommon");
        return _inject();
    });

    return it("use a test theme", function() {
        (<any>window)._version = '123';
        themeService.use(data.theme);
        return expect($("link[rel='stylesheet']")).to.have.attr("href", `/123/styles/theme-${data.theme}.css`);
    });
});
