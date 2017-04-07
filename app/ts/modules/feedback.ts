/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
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
 * File: modules/feedback.coffee
 */

import {groupBy, bindOnce, mixOf, debounce, trim} from "../utils"
import * as angular from "angular"

let module = angular.module("taigaFeedback", []);

let FeedbackDirective = function($lightboxService, $repo, $confirm, $loading, feedbackService){
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley();

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.create("feedback", $scope.feedback);

            promise.then(function(data) {
                currentLoading.finish();
                $lightboxService.close($el);
                return $confirm.notify("success", "\\o/ we'll be happy to read your");
            });

            return promise.then(null, function() {
                currentLoading.finish();
                return $confirm.notify("error");
            });
        });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        let openLightbox = function() {
            $scope.feedback = {};
            $lightboxService.open($el);
            return $el.find("textarea").focus();
        };

        $scope.$on("$destroy", () => $el.off());

        return openLightbox();
    };

    let directive = {
        link,
        templateUrl: "common/lightbox-feedback.html",
        scope: {}
    };

    return directive;
};

module.directive("tgLbFeedback", ["lightboxService", "$tgRepo", "$tgConfirm",
    "$tgLoading", "tgFeedbackService", FeedbackDirective]);
