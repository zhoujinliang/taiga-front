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
 * File: select-import-user-lightbox.directive.coffee
 */

export let SelectImportUserLightboxDirective = function(lightboxService, lightboxKeyboardNavigationService) {
    let link = (scope, el, attrs, ctrl) =>
        scope.$watch('vm.visible', function(visible) {
            if (visible && !el.hasClass('open')) {
                ctrl.start();
                return lightboxService.open(el, null, scope.vm.onClose).then(function() {
                    el.find('input').focus();
                    return lightboxKeyboardNavigationService.init(el);
                });
            } else if (!visible && el.hasClass('open')) {
                return lightboxService.close(el).then(function() {
                    ctrl.userEmail = '';
                    return ctrl.usersSearch = '';
                });
            }
        })
    ;

    return {
        controller: "SelectImportUserLightboxCtrl",
        controllerAs: "vm",
        bindToController: true,
        scope: {
            user: '<',
            visible: '<',
            onClose: '&',
            onSelectUser: '&',
            selectableUsers: '<',
            isPrivate: '<',
            limitMembersPrivateProject: '<',
            limitMembersPublicProject: '<',
            displayEmailSelector: '<'
        },
        templateUrl: 'projects/create/select-import-user-lightbox/select-import-user-lightbox.html',
        link
    };
};
SelectImportUserLightboxDirective.$inject = ['lightboxService', 'lightboxKeyboardNavigationService'];
