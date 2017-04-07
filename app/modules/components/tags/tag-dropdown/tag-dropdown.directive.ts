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
 * File: tag-line.directive.coffee
 */

let module = angular.module('taigaCommon');

let TagOptionDirective = function() {
    let select = function(selected) {
        selected.addClass('selected');

        let selectedPosition = selected.position().top + selected.outerHeight();
        let containerHeight = selected.parent().outerHeight();

        if (selectedPosition > containerHeight) {
            let diff = selectedPosition - containerHeight;
            return selected.parent().scrollTop(selected.parent().scrollTop() + diff);
        } else if (selected.position().top < 0) {
            return selected.parent().scrollTop(selected.parent().scrollTop() + selected.position().top);
        }
    };

    let dispatch = function(el, code, scope) {
        let activeElement = el.find(".selected");

        // Key: down
        if (code === 40) {
            if (!activeElement.length) {
                return select(el.find('li:first'));
            } else {
                let next = activeElement.next('li');
                if (next.length) {
                    activeElement.removeClass('selected');
                    return select(next);
                }
            }
        // Key: up
        } else if (code === 38) {
            if (!activeElement.length) {
                return select(el.find('li:last'));
            } else {
                let prev = activeElement.prev('li');

                if (prev.length) {
                    activeElement.removeClass('selected');
                    return select(prev);
                }
            }
        }
    };

    let stop = () => $(document).off(".tags-keyboard-navigation");

    let link = function(scope, el) {
        stop();

        $(el).parent().on("keydown.tags-keyboard-navigation", event => {
            let code = event.keyCode ? event.keyCode : event.which;

            if ((code === 40) || (code === 38)) {
                event.preventDefault();

                return dispatch(el, code, scope);
            }
        });

        return scope.$on("$destroy", stop);
    };

    return {
        link,
        templateUrl:"components/tags/tag-dropdown/tag-dropdown.html",
        scope: {
            onSelectTag: "&",
            colorArray: "=",
            tag: "="
        }
    };
};

module.directive("tgTagsDropdown", TagOptionDirective);
