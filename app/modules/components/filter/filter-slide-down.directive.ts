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
 * File: filter.-slide-down.controller.coffee
 */

let FilterSlideDownDirective = function() {
    let link = function(scope, el, attrs, ctrl) {
        let filter = $('tg-filter');

        return scope.$watch(attrs.ngIf, function(value) {
            if (value) {
                filter.find('.filter-list').hide();

                let wrapperHeight = filter.height();
                let contentHeight = 0;

                filter.children().each(function() {
                    return contentHeight += $(this).outerHeight(true);
                });

                return $(el.context.nextSibling)
                    .css({
                        "max-height": wrapperHeight - contentHeight,
                        "display": "block"
                    });
            }
        });
    };

    return {
        priority: 900,
        link
    };
};

angular.module('taigaComponents').directive("tgFilterSlideDown", [FilterSlideDownDirective]);
