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
 * File: modules/common/lightboxes.coffee
 */

import {Service} from "../../../ts/classes"
import {bindOnce, timeout, debounce, sizeFormat, trim} from "../../../ts/utils"
import * as _ from "lodash"
import * as $ from "jquery"
import * as angular from "angular"
import * as Immutable from "immutable"

//############################################################################
//# Common Lightbox Services
//############################################################################

// the lightboxContent hide/show doesn't have sense because is an IE hack
export class LightboxService extends Service {
    animationFrame:any
    q:any
    rootScope: angular.IScope
    onClose:any

    constructor(animationFrame, q, rootScope) {
        super()
        this.animationFrame = animationFrame;
        this.q = q;
        this.rootScope = rootScope;
    }

    open($el, onClose, onEsc) {
        this.onClose = onClose;

        if (_.isString($el)) {
            $el = $($el);
        }
        let defered = this.q.defer();

        let lightboxContent = $el.children().not(".close");
        lightboxContent.hide();

        this.animationFrame.add(() => $el.css('display', 'flex'));

        this.animationFrame.add(function() {
            $el.addClass("open");
            return $el.one("transitionend", () => {
                let firstField = $el.find('input,textarea').first();

                if (firstField.length) {
                    return $el.find('input,textarea').first().focus();
                } else if (document.activeElement) {
                    return $(document.activeElement).blur();
                }
            });
        });

        this.animationFrame.add(() => {
            lightboxContent.show();
            return defered.resolve();
        });

        let docEl = angular.element(document);
        docEl.on("keydown.lightbox", e => {
            let code = e.keyCode ? e.keyCode : e.which;
            if (code === 27) {
                if (onEsc) {
                    return this.rootScope.$applyAsync(onEsc);
                } else {
                    return this.close($el);
                }
            }
        });


        return defered.promise;
    }

    close($el) {
        return new Promise((function(resolve) {
            if (_.isString($el)) {
                $el = $($el);
            }
            let docEl = angular.element(document);
            docEl.off(".lightbox");
            docEl.off(".keyboard-navigation"); // Hack: to fix problems in the WYSIWYG textareas when press ENTER

            $el.addClass('close-started'); // don't attach animations

            this.animationFrame.add(() => {
                $el.addClass('close');

                return $el.one("transitionend", () => {
                    $el.removeAttr('style');
                    $el
                        .removeClass("open")
                        .removeClass('close')
                        .removeClass('close-started');

                    if (this.onClose) {
                        this.rootScope.$apply(this.onClose);
                    }

                    return resolve();
                });
            });

            if ($el.hasClass("remove-on-close")) {
                let scope = $el.data("scope");
                if (scope) { scope.$destroy(); }
                return $el.remove();
            }
        }.bind(this)));
    }


    getLightboxOpen() {
        return $(".lightbox.open:not(.close-started)");
    }

    closeAll() {
        let docEl = angular.element(document);
        return docEl.find(".lightbox.open").map((lightboxEl) =>
            this.close($(lightboxEl)));
    }
}

export class LightboxKeyboardNavigationService extends Service {
    stop() {
        let docEl = angular.element(document);
        return docEl.off(".keyboard-navigation");
    }

    dispatch($el, code) {
        let activeElement = $el.find(".selected");

        // Key: enter
        if (code === 13) {
            if ($el.find(".user-list-single").length === 1) {
                return $el.find('.user-list-single:first').trigger("click");
            } else {
                return activeElement.trigger("click");
            }

        // Key: down
        } else if (code === 40) {
            if (!activeElement.length) {
                return $el.find('.user-list-single:not(".is-active"):first').addClass('selected');
            } else {
                let next = activeElement.next('.user-list-single');
                if (next.length) {
                    activeElement.removeClass('selected');
                    return next.addClass('selected');
                }
            }
        // Key: up
        } else if (code === 38) {
            if (!activeElement.length) {
                return $el.find('.user-list-single:last').addClass('selected');
            } else {
                let prev = activeElement.prev('.user-list-single:not(".is-active")');

                if (prev.length) {
                    activeElement.removeClass('selected');
                    return prev.addClass('selected');
                }
            }
        }
    }

    init($el) {
        this.stop();
        let docEl = angular.element(document);
        return docEl.on("keydown.keyboard-navigation", event => {
            let code = event.keyCode ? event.keyCode : event.which;
            if ((code === 40) || (code === 38) || (code === 13)) {
                event.preventDefault();
                return this.dispatch($el, code);
            }
        });
    }
}

//############################################################################
//# Generic Lighthbox Directive
//############################################################################

// This adds generic behavior to all blocks with lightbox class like
// close button event handlers.

export let LightboxDirective = function(lightboxService) {
    let link = function($scope, $el, $attrs) {

        if (!$attrs.$attr.visible) {
            return $el.on("click", ".close", function(event) {
                event.preventDefault();
                return lightboxService.close($el);
            });
        }
    };

    return {restrict: "C", link};
};

//############################################################################
//# Block Lightbox Directive
//############################################################################

// Issue/Userstory blocking message lightbox directive.

export let BlockLightboxDirective = function($rootscope, $tgrepo, $confirm, lightboxService, $loading, $modelTransform, $translate) {
    let link = function($scope, $el, $attrs, $model) {
        let transform;
        let title = $translate.instant($attrs.title);
        $el.find("h2.title").text(title);

        let unblock = finishCallback => {
            transform = $modelTransform.save(function(item) {
                item.is_blocked = false;
                item.blocked_note = "";

                return item;
            });

            transform.then(function() {
                $confirm.notify("success");
                $rootscope.$broadcast("object:updated");
                return finishCallback();
            });

            transform.then(null, function(item) {
                $confirm.notify("error");
                return item.revert();
            });

            transform.finally(() => finishCallback());

            return transform;
        };

        let block = function() {
            let currentLoading = $loading()
                .target($el.find(".button-green"))
                .start();

            transform = $modelTransform.save(function(item) {
                item.is_blocked = true;
                item.blocked_note = $el.find(".reason").val();

                return item;
            });

            transform.then(function() {
                $confirm.notify("success");
                return $rootscope.$broadcast("object:updated");
            });

            transform.then(null, () => $confirm.notify("error"));

            return transform.finally(function() {
                currentLoading.finish();
                return lightboxService.close($el);
            });
        };

        $scope.$on("block", function() {
            $el.find(".reason").val($model.$modelValue.blocked_note);
            return lightboxService.open($el);
        });

        $scope.$on("unblock", (event, model, finishCallback) => {
            return unblock(finishCallback);
        });

        $scope.$on("$destroy", () => $el.off());

        return $el.on("click", ".button-green", function(event) {
            event.preventDefault();

            return block();
        });
    };

    return {
        templateUrl: "common/lightbox/lightbox-block.html",
        link,
        require: "ngModel"
    };
};

//############################################################################
//# Generic Lightbox Blocking-Message Input Directive
//############################################################################

export let BlockingMessageInputDirective = function($log, $template, $compile) {
    let template = $template.get("common/lightbox/lightbox-blocking-message-input.html", true);

    let link = function($scope, $el, $attrs, $model) {
        if (!$attrs.watch) {
            return $log.error("No watch attribute on tg-blocking-message-input directive");
        }

        return $scope.$watch($attrs.watch, function(value) {
            if ((value === !undefined) && (value === true)) {
                return $el.find(".blocked-note").removeClass("hidden");
            } else {
                return $el.find(".blocked-note").addClass("hidden");
            }
        });
    };

    let templateFn = ($el, $attrs) => template({ngmodel: $attrs.ngModel});

    return {
        template: templateFn,
        link,
        require: "ngModel",
        restrict: "EA"
    };
};

//############################################################################
//# Create/Edit Userstory Lightbox Directive
//############################################################################

export let CreateEditUserstoryDirective = function($repo, $model, $rs, $rootScope, lightboxService, $loading, $translate, $confirm, $q, attachmentsService) {
    let link = function($scope, $el, attrs) {
        let form = null;
        $scope.createEditUs = {};
        $scope.isNew = true;

        let attachmentsToAdd = Immutable.List();
        let attachmentsToDelete = Immutable.List();

        let resetAttachments = function() {
            attachmentsToAdd = Immutable.List();
            return attachmentsToDelete = Immutable.List();
        };

        $scope.addAttachment = attachment => attachmentsToAdd = attachmentsToAdd.push(attachment);

        $scope.deleteAttachment = function(attachment) {
            attachmentsToAdd = <Immutable.List<any>>attachmentsToAdd.filter((it:Immutable.Map<string,any>) => it.get('name') !== attachment.get('name'));

            if (attachment.get("id")) {
                return attachmentsToDelete = attachmentsToDelete.push(attachment);
            }
        };

        $scope.addTag = function(tag, color) {
            let value = trim(tag.toLowerCase());

            let { tags } = $scope.project;
            let projectTags = $scope.project.tags_colors;

            if ((tags == null)) { tags = []; }
            if ((projectTags == null)) { projectTags = {}; }

            if (!tags.includes(value)) {
                tags.push(value);
            }

            projectTags[tag] = color || null;

            $scope.project.tags = tags;

            let itemtags = _.clone($scope.us.tags);

            let inserted = _.find(itemtags, it => it[0] === value);

            if (!inserted) {
                itemtags.push([value , color]);
                return $scope.us.tags = itemtags;
            }
        };

        $scope.deleteTag = function(tag) {
            let value = trim(tag[0].toLowerCase());

            let { tags } = $scope.project;
            let itemtags = _.clone($scope.us.tags);

            _.remove(itemtags, tag => tag[0] === value);

            $scope.us.tags = itemtags;

            return _.pull($scope.us.tags, value);
        };

        $scope.$on("usform:new", function(ctx, projectId, status, statusList) {
            if (form) { form.reset(); }
            $scope.isNew = true;
            $scope.usStatusList = statusList;
            $scope.attachments = Immutable.List();

            resetAttachments();

            $scope.us = $model.make_model("userstories", {
                project: projectId,
                points : {},
                status,
                is_archived: false,
                tags: []
            });

            // Update texts for creation
            $el.find(".button-green").html($translate.instant("COMMON.CREATE"));
            $el.find(".title").html($translate.instant("LIGHTBOX.CREATE_EDIT_US.NEW_US"));
            $el.find(".tag-input").val("");

            $el.find(".blocked-note").addClass("hidden");
            $el.find("label.blocked").removeClass("selected");
            $el.find("label.team-requirement").removeClass("selected");
            $el.find("label.client-requirement").removeClass("selected");

            $scope.createEditUsOpen = true;

            return lightboxService.open($el, () => $scope.createEditUsOpen = false);
        });

        $scope.$on("usform:edit", function(ctx, us, attachments) {
            if (form) { form.reset(); }

            $scope.us = us;
            $scope.attachments = Immutable.fromJS(attachments);
            $scope.isNew = false;

            resetAttachments();

            // Update texts for edition
            $el.find(".button-green").html($translate.instant("COMMON.SAVE"));
            $el.find(".title").html($translate.instant("LIGHTBOX.CREATE_EDIT_US.EDIT_US"));
            $el.find(".tag-input").val("");

            // Update requirement info (team, client or blocked)
            if (us.is_blocked) {
                $el.find(".blocked-note").removeClass("hidden");
                $el.find("label.blocked").addClass("selected");
            } else {
                $el.find(".blocked-note").addClass("hidden");
                $el.find("label.blocked").removeClass("selected");
            }

            if (us.team_requirement) {
                $el.find("label.team-requirement").addClass("selected");
            } else {
                $el.find("label.team-requirement").removeClass("selected");
            }
            if (us.client_requirement) {
                $el.find("label.client-requirement").addClass("selected");
            } else {
                $el.find("label.client-requirement").removeClass("selected");
            }

            $scope.createEditUsOpen = true;

            return lightboxService.open($el, () => $scope.createEditUsOpen = false);
        });

        let createAttachments = function(obj) {
            let promises = _.map(attachmentsToAdd.toJS(), (attachment:any) => attachmentsService.upload(attachment.file, obj.id, $scope.us.project, 'us'));

            return $q.all(promises);
        };

        let deleteAttachments = function(obj) {
            let promises = _.map(attachmentsToDelete.toJS(), (attachment:any) => attachmentsService.delete("us", attachment.id));

            return $q.all(promises);
        };

        let submit = debounce(2000, event => {
            let broadcastEvent, promise;
            event.preventDefault();

            form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let params = {
                include_attachments: true,
                include_tasks: true
            };

            if ($scope.isNew) {
                promise = $repo.create("userstories", $scope.us);
                broadcastEvent = "usform:new:success";
            } else {
                promise = $repo.save($scope.us, true);
                broadcastEvent = "usform:edit:success";
            }

            promise.then(data =>
                deleteAttachments(data)
                    .then(() => createAttachments(data))
                    .then(() => {
                        currentLoading.finish();
                        lightboxService.close($el);

                        return $rs.userstories.getByRef(data.project, data.ref, params).then(us => $rootScope.$broadcast(broadcastEvent, us));
                })
            );


            return promise.then(null, function(data) {
                currentLoading.finish();
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        $el.on("click", ".close", function(event) {
            event.preventDefault();

            $scope.$apply(() => $scope.us.revert());

            return lightboxService.close($el);
        });

        $el.keydown(function(event) {
            let code = event.keyCode ? event.keyCode : event.which;
            if (code === 27) {
                lightboxService.close($el);
                return $scope.$apply(() => $scope.us.revert());
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Creare Bulk Userstories Lightbox Directive
//############################################################################

export let CreateBulkUserstoriesDirective = function($repo, $rs, $rootscope, lightboxService, $loading, $model, $confirm) {
    let link = function($scope, $el, attrs) {
        let form = null;

        $scope.$on("usform:bulk", function(ctx, projectId, status) {
            if (form) { form.reset(); }

            $scope.new = {
                projectId,
                statusId: status,
                bulk: ""
            };
            return lightboxService.open($el);
        });

        let submit = debounce(2000, event => {
            event.preventDefault();

            form = $el.find("form").checksley({onlyOneErrorElement: true});
            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $rs.userstories.bulkCreate($scope.new.projectId, $scope.new.statusId, $scope.new.bulk);
            promise.then(function(result) {
                result =  _.map(result.data, x => $model.make_model('userstories', x));
                currentLoading.finish();
                $rootscope.$broadcast("usform:bulk:success", result);
                return lightboxService.close($el);
            });

            return promise.then(null, function(data) {
                currentLoading.finish();
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# AssignedTo Lightbox Directive
//############################################################################

export let AssignedToLightboxDirective = function(lightboxService, lightboxKeyboardNavigationService, $template, $compile, avatarService) {
    let link = function($scope, $el, $attrs) {
        let selectedUser = null;
        let selectedItem = null;
        let usersTemplate = $template.get("common/lightbox/lightbox-assigned-to-users.html", true);

        let normalizeString = function(string) {
            let normalizedString = string;
            normalizedString = normalizedString.replace("Á", "A").replace("Ä", "A").replace("À", "A");
            normalizedString = normalizedString.replace("É", "E").replace("Ë", "E").replace("È", "E");
            normalizedString = normalizedString.replace("Í", "I").replace("Ï", "I").replace("Ì", "I");
            normalizedString = normalizedString.replace("Ó", "O").replace("Ö", "O").replace("Ò", "O");
            normalizedString = normalizedString.replace("Ú", "U").replace("Ü", "U").replace("Ù", "U");
            return normalizedString;
        };

        let filterUsers = function(text, user) {
            let username = user.full_name_display.toUpperCase();
            username = normalizeString(username);
            text = text.toUpperCase();
            text = normalizeString(text);
            return _.includes(username, text);
        };

        let render = function(selected, text=null) {
            let users = _.cloneDeep($scope.activeUsers);
            if (selected != null) { users = _.reject(users, {"id": selected.id}); }
            users = _.sortBy(users, function(o:any) { if (o.id === $scope.user.id) { return 0; } else { return o.id; } });
            if (text != null) { users = _.filter(users, _.partial(filterUsers, text)); }

            let visibleUsers = _.slice(users, 0, 5);

            visibleUsers = _.map(visibleUsers, (user:any) => user.avatar = avatarService.getAvatar(user));

            if (selected) {
                if (selected) { selected.avatar = avatarService.getAvatar(selected); }
            }

            let ctx = {
                selected,
                users: _.slice(users, 0, 5),
                showMore: users.length > 5
            };

            let html = usersTemplate(ctx);
            html = $compile(html)($scope);

            return $el.find(".assigned-to-list").html(html);
        };

        let closeLightbox = function() {
            lightboxKeyboardNavigationService.stop();
            return lightboxService.close($el);
        };

        $scope.$on("assigned-to:add", function(ctx, item) {
            selectedItem = item;
            let assignedToId = item.assigned_to;
            selectedUser = $scope.usersById[assignedToId];

            render(selectedUser);
            return lightboxService.open($el).then(function() {
                $el.find('input').focus();
                return lightboxKeyboardNavigationService.init($el);
            });
        });

        $scope.$watch("usersSearch", function(searchingText) {
            if (searchingText != null) {
                render(selectedUser, searchingText);
                return $el.find('input').focus();
            }
        });

        $el.on("click", ".user-list-single", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);

            closeLightbox();

            return $scope.$apply(function() {
                $scope.$broadcast("assigned-to:added", target.data("user-id"), selectedItem);
                return $scope.usersSearch = null;
            });
        });

        $el.on("click", ".remove-assigned-to", function(event) {
            event.preventDefault();
            event.stopPropagation();

            closeLightbox();

            return $scope.$apply(function() {
                $scope.usersSearch = null;
                return $scope.$broadcast("assigned-to:added", null, selectedItem);
            });
        });

        $el.on("click", ".close", function(event) {
            event.preventDefault();

            closeLightbox();

            return $scope.$apply(() => $scope.usersSearch = null);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        templateUrl: "common/lightbox/lightbox-assigned-to.html",
        link
    };
};

//############################################################################
//# Watchers Lightbox directive
//############################################################################

export let WatchersLightboxDirective = function($repo, lightboxService, lightboxKeyboardNavigationService, $template, $compile, avatarService) {
    let link = function($scope, $el, $attrs) {
        let selectedItem = null;
        let usersTemplate = $template.get("common/lightbox/lightbox-assigned-to-users.html", true);

        // Get prefiltered users by text
        // and without now watched users.
        let getFilteredUsers = function(text="") {
            let _filterUsers = function(text, user) {
                if (selectedItem && _.find(selectedItem.watchers, x => x === user.id)) {
                    return false;
                }

                let username = user.full_name_display.toUpperCase();
                text = text.toUpperCase();
                return _.includes(username, text);
            };

            let users = _.cloneDeep($scope.activeUsers);
            users = _.filter(users, _.partial(_filterUsers, text));
            return users;
        };

        // Render the specific list of users.
        let render = function(users) {
            let visibleUsers = _.slice(users, 0, 5);

            visibleUsers = _.map(visibleUsers, function(user:any) {
                user.avatar = avatarService.getAvatar(user);

                return user;
            });

            let ctx = {
                selected: false,
                users: visibleUsers,
                showMore: users.length > 5
            };

            let html = usersTemplate(ctx);
            html = $compile(html)($scope);
            return $el.find(".ticket-watchers").html(html);
        };

        let closeLightbox = function() {
            lightboxKeyboardNavigationService.stop();
            return lightboxService.close($el);
        };

        $scope.$on("watcher:add", function(ctx, item) {
            selectedItem = item;

            let users = getFilteredUsers();
            render(users);

            return lightboxService.open($el).then(function() {
                $el.find("input").focus();
                return lightboxKeyboardNavigationService.init($el);
            });
        });

        $scope.$watch("usersSearch", function(searchingText) {
            if ((searchingText == null)) {
                return;
            }

            let users = getFilteredUsers(searchingText);
            render(users);
            return $el.find("input").focus();
        });

        $el.on("click", ".user-list-single", debounce(200, function(event) {
            closeLightbox();

            event.preventDefault();
            let target = angular.element(event.currentTarget);

            return $scope.$apply(function() {
                $scope.usersSearch = null;
                return $scope.$broadcast("watcher:added", target.data("user-id"));
            });
        })
        );

        $el.on("click", ".close", function(event) {
            event.preventDefault();

            closeLightbox();

            return $scope.$apply(() => $scope.usersSearch = null);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        templateUrl: "common/lightbox/lightbox-users.html",
        link
    };
};

export let LightboxLeaveProjectWarningDirective = function(lightboxService, $template, $compile) {
    let link = ($scope, $el, attrs) => lightboxService.open($el);

    return {
        templateUrl: 'common/lightbox/lightbox-leave-project-warning.html',
        link,
        scope: true
    };
};
