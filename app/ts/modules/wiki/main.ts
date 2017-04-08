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
 * File: modules/wiki/detail.coffee
 */

import {groupBy, bindOnce, debounce} from "../../utils"
import {PageMixin} from "../controllerMixins"
import * as angular from "angular"
import * as moment from "moment"
import * as _ from "lodash"

let module = angular.module("taigaWiki");

//############################################################################
//# Wiki Detail Controller
//############################################################################

class WikiDetailController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    model:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    filter:any
    log:any
    appMetaService:any
    navUrls:any
    analytics:any
    translate:any
    errorHandlingService:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgModel",
            "$tgConfirm",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$filter",
            "$log",
            "tgAppMetaService",
            "$tgNavUrls",
            "$tgAnalytics",
            "$translate",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, model, confirm, rs, params, q, location,
                  filter, log, appMetaService, navUrls, analytics, translate, errorHandlingService, projectService) {
        super()
        this.loadWiki = this.loadWiki.bind(this);
        this.moveLink = this.moveLink.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.model = model;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.filter = filter;
        this.log = log;
        this.appMetaService = appMetaService;
        this.navUrls = navUrls;
        this.analytics = analytics;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        this.scope.$on("wiki:links:move", this.moveLink);
        this.scope.$on("wikipage:add", this.loadWiki);
        this.scope.projectSlug = this.params.pslug;
        this.scope.wikiSlug = this.params.slug;
        this.scope.sectionName = "Wiki";
        this.scope.linksVisible = false;

        let promise = this.loadInitialData();

        // On Success
        promise.then(() => this._setMeta());

        // On Error
        promise.then(null, this.onInitialDataError.bind(this));
    }

    _setMeta() {
        let title =  this.translate.instant("WIKI.PAGE_TITLE", {
            wikiPageName: this.scope.wikiSlug,
            projectName: this.scope.project.name
        });
        let description =  this.translate.instant("WIKI.PAGE_DESCRIPTION", {
            wikiPageContent: angular.element((this.scope.wiki != null ? this.scope.wiki.html : undefined) || "").text(),
            totalEditions: (this.scope.wiki != null ? this.scope.wiki.editions : undefined) || 0,
            lastModifiedDate: moment(this.scope.wiki != null ? this.scope.wiki.modified_date : undefined).format(this.translate.instant("WIKI.DATETIME"))
        });

        return this.appMetaService.setAll(title, description);
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.is_wiki_activated) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadWiki() {
        let promise = this.rs.wiki.getBySlug(this.scope.projectId, this.params.slug);
        promise.then(wiki => {
            this.scope.wiki = wiki;
            this.scope.wikiId = wiki.id;
            return this.scope.wiki;
        });

        return promise.then(null, xhr => {
            this.scope.wikiId = null;

            if (this.scope.project.my_permissions.indexOf("add_wiki_page") === -1) {
                return null;
            }

            let data = {
                project: this.scope.projectId,
                slug: this.scope.wikiSlug,
                content: ""
            };
            this.scope.wiki = this.model.make_model("wiki", data);
            return this.scope.wiki;
        });
    }

    loadWikiLinks() {
        return this.rs.wiki.listLinks(this.scope.projectId).then(wikiLinks => {
            let selectedWikiLink;
            this.scope.wikiLinks = wikiLinks;

            let link:any;

            for (link of this.scope.wikiLinks) {
                link.url = this.navUrls.resolve("project-wiki-page", {
                    project: this.scope.projectSlug,
                    slug: link.href
                });
            }

            return selectedWikiLink = _.find(wikiLinks, {href: this.scope.wikiSlug});
        });
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);
        return this.q.all([this.loadWikiLinks(), this.loadWiki()]).then(this.checkLinksPerms.bind(this));
    }

    checkLinksPerms() {
        if ((this.scope.project.my_permissions.indexOf("add_wiki_link") !== -1) ||
          ((this.scope.project.my_permissions.indexOf("view_wiki_links") !== -1) && this.scope.wikiLinks.length)) {
            return this.scope.linksVisible = true;
        }
    }

    delete() {
        let title = this.translate.instant("WIKI.DELETE_LIGHTBOX_TITLE");
        let message = this.scope.wikiSlug;

        return this.confirm.askOnDelete(title, message).then(askResponse => {
            let onSuccess = () => {
                askResponse.finish();
                let ctx = {project: this.scope.projectSlug};
                this.location.path(this.navUrls.resolve("project-wiki", ctx));
                this.confirm.notify("success");
                return this.loadWiki();
            };

            let onError = () => {
                askResponse.finish(false);
                return this.confirm.notify("error");
            };

            return this.repo.remove(this.scope.wiki).then(onSuccess, onError);
        });
    }

    moveLink(ctx, item, itemIndex) {
        let values = this.scope.wikiLinks;
        let r = values.indexOf(item);
        values.splice(r, 1);
        values.splice(itemIndex, 0, item);
        _.each(values, (value, index) => value.order = index);

        return this.repo.saveAll(values);
    }
}
WikiDetailController.initClass();

module.controller("WikiDetailController", WikiDetailController);


//############################################################################
//# Wiki Summary Directive
//############################################################################

let WikiSummaryDirective = function($log, $template, $compile, $translate, avatarService) {
    let template = $template.get("wiki/wiki-summary.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let render = function(wiki) {
            let user;
            if (($scope.usersById == null)) {
                $log.error("WikiSummaryDirective requires userById set in scope.");
            } else {
                user = $scope.usersById[wiki.last_modifier];
            }

            let avatar = avatarService.getAvatar(user);

            if (user === undefined) {
                user = {name: "unknown", avatar};
            } else {
                user = {name: user.full_name_display, avatar};
            }

            let ctx = {
                totalEditions: wiki.editions,
                lastModifiedDate: moment(wiki.modified_date).format($translate.instant("WIKI.DATETIME")),
                user
            };
            let html = template(ctx);
            html = $compile(html)($scope);
            return $el.html(html);
        };

        $scope.$watch($attrs.ngModel, function(wikiPage) {
            if (!wikiPage) { return; }
            return render(wikiPage);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgWikiSummary", ["$log", "$tgTemplate", "$compile", "$translate",  "tgAvatarService", WikiSummaryDirective]);

let WikiWysiwyg = function($modelTransform, $rootscope, $confirm, attachmentsFullService,
$qqueue, $repo, $analytics, wikiHistoryService) {
    let link = function($scope, $el, $attrs) {
        $scope.editableDescription = false;

        $scope.saveDescription = $qqueue.bindAdd(function(description, cb) {
            let promise;
            let onSuccess = function(wikiPage) {
                if (($scope.item.id == null)) {
                    $analytics.trackEvent("wikipage", "create", "create wiki page", 1);
                    $scope.$emit("wikipage:add");
                }

                wikiHistoryService.loadHistoryEntries();
                return $confirm.notify("success");
            };

            let onError = () => $confirm.notify("error");

            $scope.item.content =  description;

            if ($scope.item.id != null) {
                promise = $repo.save($scope.item).then(onSuccess, onError);
            } else {
                promise = $repo.create("wiki", $scope.item).then(onSuccess, onError);
            }

            return promise.finally(cb);
        });

        let uploadFile = (file, cb) =>
            attachmentsFullService.addAttachment($scope.project.id, $scope.item.id, 'wiki_page', file).then(result => cb(result.getIn(['file', 'name']), result.getIn(['file', 'url'])))
        ;

        $scope.uploadFiles = (files, cb) =>
            files.map((file) =>
                uploadFile(file, cb))
        ;

        $scope.$watch($attrs.model, function(value) {
            if (!value) { return; }
            $scope.item = value;
            $scope.version = value.version;
            return $scope.storageKey = $scope.project.id + "-" + value.id + "-wiki";
        });

        return $scope.$watch('project', function(project) {
            if (!project) { return; }

            return $scope.editableDescription = project.my_permissions.indexOf("modify_wiki_page") !== -1;
        });
    };

    return {
        scope: true,
        link,
        template: `\
<div>
    <tg-wysiwyg
        ng-if="editableDescription"
        version='version'
        storage-key='storageKey'
        content='item.content'
        on-save='saveDescription(text, cb)'
        on-upload-file='uploadFiles(files, cb)'>
    </tg-wysiwyg>

    <div
        class="wysiwyg"
        ng-if="!editableDescription && item.content.length"
        ng-bind-html="item.content | markdownToHTML"></div>

    <div
        class="wysiwyg"
        ng-if="!editableDescription && !item.content.length">
        {{'COMMON.DESCRIPTION.NO_DESCRIPTION' | translate}}
    </div>
</div>\
`
    };
};

module.directive("tgWikiWysiwyg", [
    "$tgQueueModelTransformation",
    "$rootScope",
    "$tgConfirm",
    "tgAttachmentsFullService",
    "$tgQqueue", "$tgRepo", "$tgAnalytics", "tgWikiHistoryService",
    WikiWysiwyg]);
