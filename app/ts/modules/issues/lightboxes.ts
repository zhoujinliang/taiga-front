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
 * File: modules/issues/lightboxes.coffee
 */

import {debounce, trim} from "../../utils"
import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

let module = angular.module("taigaIssues");

//############################################################################
//# Issue Create Lightbox Directive
//############################################################################

let CreateIssueDirective = function($repo, $confirm, $rootscope, lightboxService, $loading, $q, attachmentsService) {
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley();
        $scope.issue = {};
        $scope.attachments = Immutable.List();

        $scope.$on("issueform:new", function(ctx, project){
            form.reset();

            resetAttachments();

            $el.find(".tag-input").val("");
            lightboxService.open($el, () => $scope.createIssueOpen = false);

            $scope.issue = {
                project: project.id,
                subject: "",
                status: project.default_issue_status,
                type: project.default_issue_type,
                priority: project.default_priority,
                severity: project.default_severity,
                tags: []
            };

            return $scope.createIssueOpen = true;
        });

        $scope.$on("$destroy", () => $el.off());

        let createAttachments = function(obj) {
            let promises = _.map(attachmentsToAdd.toJS(), (attachment:any) => attachmentsService.upload(attachment.file, obj.id, $scope.issue.project, 'issue'));

            return $q.all(promises);
        };

        var attachmentsToAdd = Immutable.List();

        var resetAttachments = function() {
            attachmentsToAdd = Immutable.List();
            return $scope.attachments = Immutable.List();
        };

        $scope.addAttachment = attachment => attachmentsToAdd = attachmentsToAdd.push(attachment);

        $scope.deleteAttachment = attachment =>
            attachmentsToAdd = <Immutable.List<any>>attachmentsToAdd.filter((it:Immutable.Map<string,any>) => it.get('name') !== attachment.get('name'))
        ;

        $scope.addTag = function(tag, color) {
            let value = trim(tag.toLowerCase());

            let { tags } = $scope.project;
            let projectTags = $scope.project.tags_colors;

            if ((tags == null)) { tags = []; }
            if ((projectTags == null)) { projectTags = {}; }

            if (!Array.from(tags).includes(value)) {
                tags.push(value);
            }

            projectTags[tag] = color || null;

            $scope.project.tags = tags;

            let itemtags = _.clone($scope.issue.tags);

            let inserted = _.find(itemtags, it => it[0] === value);

            if (!inserted) {
                itemtags.push([tag , color]);
                return $scope.issue.tags = itemtags;
            }
        };

        $scope.deleteTag = function(tag) {
            let value = trim(tag[0].toLowerCase());

            let { tags } = $scope.project;
            let itemtags = _.clone($scope.issue.tags);

            _.remove(itemtags, tag => tag[0] === value);

            $scope.issue.tags = itemtags;

            return _.pull($scope.issue.tags, value);
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.create("issues", $scope.issue);

            promise.then(data => createAttachments(data));

            promise.then(function(data) {
                currentLoading.finish();
                $rootscope.$broadcast("issueform:new:success", data);
                lightboxService.close($el);
                return $confirm.notify("success");
            });

            return promise.then(null, function() {
                currentLoading.finish();
                return $confirm.notify("error");
            });
        });

        var submitButton = $el.find(".submit-button");

        return $el.on("submit", "form", submit);
    };


    return {link};
};

module.directive("tgLbCreateIssue", ["$tgRepo", "$tgConfirm", "$rootScope", "lightboxService", "$tgLoading",
                                     "$q", "tgAttachmentsService", CreateIssueDirective]);


//############################################################################
//# Issue Bulk Create Lightbox Directive
//############################################################################

let CreateBulkIssuesDirective = function($repo, $rs, $confirm, $rootscope, $loading, lightboxService) {
    let link = function($scope, $el, attrs) {
        let form = null;

        $scope.$on("issueform:bulk", function(ctx, projectId, status){
            if (form) { form.reset(); }

            lightboxService.open($el);
            return $scope.new = {
                projectId,
                bulk: ""
            };
    });

        let submit = debounce(2000, event => {
            event.preventDefault();

            form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let data = $scope.new.bulk;
            let { projectId } = $scope.new;

            let promise = $rs.issues.bulkCreate(projectId, data);
            promise.then(function(result) {
                currentLoading.finish();
                $rootscope.$broadcast("issueform:new:success", result);
                lightboxService.close($el);
                return $confirm.notify("success");
            });

            return promise.then(null, function() {
                currentLoading.finish();
                return $confirm.notify("error");
            });
        });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgLbCreateBulkIssues", ["$tgRepo", "$tgResources", "$tgConfirm", "$rootScope", "$tgLoading",
                                          "lightboxService", CreateBulkIssuesDirective]);
