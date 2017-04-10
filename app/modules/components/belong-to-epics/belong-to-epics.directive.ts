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
 * File: belong-to-epics.directive.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

export let BelongToEpicsDirective = function() {

    let link = (scope, el, attrs) =>
        scope.$watch('epics', function(epics) {
            if (epics && !epics.isIterable) {
              return scope.epics = Immutable.fromJS(epics);
          }
        })
    ;

    let templateUrl = function(el, attrs) {
        if (attrs.format) {
            return `components/belong-to-epics/belong-to-epics-${attrs.format}.html`;
        }
        return "components/belong-to-epics/belong-to-epics-pill.html";
    };

    return {
        link,
        scope: {
            epics: '='
        },
        templateUrl
    };
};


