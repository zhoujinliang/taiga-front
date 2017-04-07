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
 * File: modules/components/wysiwyg/item-wysiwyg.directive.coffee
 */

// Used in details descriptions
let ItemWysiwyg = function($modelTransform, $rootscope, $confirm, attachmentsFullService, $translate) {
    let link = function($scope, $el, $attrs) {
        $scope.editableDescription = false;

        $scope.saveDescription = function(description, cb) {
            let transform = $modelTransform.save(function(item) {
                item.description = description;

                return item;
            });

            transform.then(function() {
                $confirm.notify("success");
                return $rootscope.$broadcast("object:updated");
            });

            transform.then(null, () => $confirm.notify("error"));

            return transform.finally(cb);
        };

        let uploadFile = (file, cb) =>
            attachmentsFullService.addAttachment($scope.project.id, $scope.item.id, $attrs.type, file).then(result => cb(result.getIn(['file', 'name']), result.getIn(['file', 'url'])))
        ;

        $scope.uploadFiles = (files, cb) =>
            Array.from(files).map((file) =>
                uploadFile(file, cb))
        ;

        $scope.$watch($attrs.model, function(value) {
            if (!value) { return; }
            $scope.item = value;
            $scope.version = value.version;
            return $scope.storageKey = $scope.project.id + "-" + value.id + "-" + $attrs.type;
        });

        return $scope.$watch('project', function(project) {
            if (!project) { return; }

            return $scope.editableDescription = project.my_permissions.indexOf($attrs.requiredPerm) !== -1;
        });
    };

    return {
        scope: true,
        link,
        template: `\
<div>
    <tg-wysiwyg
        ng-if="editableDescription"
        placeholder='{{"COMMON.DESCRIPTION.EMPTY" | translate}}'
        version='version'
        storage-key='storageKey'
        content='item.description'
        on-save='saveDescription(text, cb)'
        on-upload-file='uploadFiles(files, cb)'>
    </tg-wysiwyg>

    <div
        class="wysiwyg"
        ng-if="!editableDescription && item.description.length"
        ng-bind-html="item.description | markdownToHTML"></div>

    <div
        class="wysiwyg"
        ng-if="!editableDescription && !item.description.length">
        {{'COMMON.DESCRIPTION.NO_DESCRIPTION' | translate}}
    </div>
</div>\
`
    };
};

angular.module("taigaComponents")
    .directive("tgItemWysiwyg", [
        "$tgQueueModelTransformation",
        "$rootScope",
        "$tgConfirm",
        "tgAttachmentsFullService",
        "$translate",
        ItemWysiwyg]);
