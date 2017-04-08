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
 * File: lightbox-factory.service.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

class LightboxFactory {
    rootScope: angular.IScope
    compile: any

    static initClass() {
        this.$inject = ["$rootScope", "$compile"];
    }
    constructor(rootScope, compile) {
        this.rootScope = rootScope;
        this.compile = compile;
    }

    create(name, attrs, scopeAttrs) {
        let scope = this.rootScope.$new();

        scope = _.merge(scope, scopeAttrs);

        let elm = $("<div>")
            .attr(name, "1")
            .attr("tg-bind-scope", "1");

        if (attrs) {
            elm.attr(attrs);
        }

        elm.addClass("remove-on-close");

        let html = this.compile(elm)(scope);

        $(document.body).append(html);

    }
}
LightboxFactory.initClass();

angular.module("taigaCommon").service("tgLightboxFactory", LightboxFactory);
