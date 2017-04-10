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
 * File: avatar.directive.coffee
 */

export let AvatarDirective = function(avatarService) {
    let link = function(scope, el, attrs) {
        let attributeName;
        if (attrs.tgAvatarBig) {
            attributeName = 'avatarBig';
        } else {
            attributeName = 'avatar';
        }

        return scope.$watch(attributeName, function(user) {
            let avatar = avatarService.getAvatar(user, attributeName);

            el.attr('src', avatar.url);
            return el.css('background', avatar.bg || "");
        });
    };

    return {
        link,
        scope: {
             avatar: "=tgAvatar",
             avatarBig: "=tgAvatarBig"
        }
    };
};

AvatarDirective.$inject = [
    'tgAvatarService'
];
