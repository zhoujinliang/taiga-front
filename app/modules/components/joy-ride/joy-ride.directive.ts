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
 * File: joy-ride.directive.coffee
 */

import * as angular from "angular"
import {introJs} from "../../../ts/global"

let JoyRideDirective = function($rootScope, currentUserService, joyRideService, $location, $translate) {
    let link = function(scope, el, attrs, ctrl) {
        let unsuscribe = null;
        let intro = introJs();

        intro.oncomplete(() => $('html,body').scrollTop(0));

        intro.onexit(() => currentUserService.disableJoyRide());

        let initJoyrRide = function(next, config) {
            if (!config[next.joyride]) {
                return;
            }

            intro.setOptions({
                exitOnEsc: false,
                exitOnOverlayClick: false,
                showStepNumbers: false,
                nextLabel: $translate.instant('JOYRIDE.NAV.NEXT') + ' &rarr;',
                prevLabel: `&larr; ${$translate.instant('JOYRIDE.NAV.BACK')}`,
                skipLabel: $translate.instant('JOYRIDE.NAV.SKIP'),
                doneLabel: $translate.instant('JOYRIDE.NAV.DONE'),
                disableInteraction: true
            });

            intro.setOption('steps', joyRideService.get(next.joyride));
            return intro.start();
        };

        return $rootScope.$on('$routeChangeSuccess',  function(event, next) {
            if (!next.joyride || !currentUserService.isAuthenticated()) {
                intro.exit();
                if (unsuscribe) { unsuscribe(); }
                return;
            }


            intro.oncomplete(() => currentUserService.disableJoyRide(next.joyride));

            if (next.loader) {
                return unsuscribe = $rootScope.$on('loader:end',  function() {
                    currentUserService.loadJoyRideConfig()
                        .then(config => initJoyrRide(next, config));

                    return unsuscribe();
                });
            } else {
                return currentUserService.loadJoyRideConfig()
                    .then(config => initJoyrRide(next, config));
            }
        });
    };

    return {
        scope: {},
        link
    };
};

JoyRideDirective.$inject = [
    "$rootScope",
    "tgCurrentUserService",
    "tgJoyRideService",
    "$location",
    "$translate"
];

angular.module("taigaComponents").directive("tgJoyRide", JoyRideDirective);
