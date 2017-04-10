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
 * File: modules/admin/project-profile.coffee
 */

import {debounce, getDefaulColorList} from "../../utils"
import {Controller} from "../../classes"
import {PageMixin} from "../controllerMixins"
import {autoScroll} from "../../libs/dom-autoscroller"

import * as dragula from "dragula"
import * as angular from "angular"
import * as _ from "lodash"

//############################################################################
//# Project values section Controller
//############################################################################

export class ProjectValuesSectionController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    navUrls:any
    appMetaService:any
    translate:any
    errorHandlingService:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$tgNavUrls",
            "tgAppMetaService",
            "$translate",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls,
                  appMetaService, translate, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        this.scope.project = {};

        this.loadInitialData();

        let sectionName = this.translate.instant(this.scope.sectionName);

        let title = this.translate.instant("ADMIN.PROJECT_VALUES.PAGE_TITLE", {
            "sectionName": sectionName,
            "projectName": this.scope.project.name
        });

        let { description } = this.scope.project;
        this.appMetaService.setAll(title, description);
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.i_am_admin) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        let promise = this.loadProject();
        return promise;
    }
}
ProjectValuesSectionController.initClass();

//############################################################################
//# Project values Controller
//############################################################################

export class ProjectValuesController extends Controller {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs) {
        super()
        this.loadValues = this.loadValues.bind(this);
        this.moveValue = this.moveValue.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.scope.$on("admin:project-values:move", this.moveValue);

        var unwatch = this.scope.$watch("resource", resource => {
            if (resource) {
                this.loadValues();
                return unwatch();
            }
        });
    }
    loadValues() {
        return this.rs[this.scope.resource].listValues(this.scope.projectId, this.scope.type).then((values:any[]) => {
            this.scope.values = values;
            this.scope.maxValueOrder = _.maxBy(values, "order").order;
            return values;
        });
    }

    moveValue(ctx, itemValue, itemIndex) {
        let { values } = this.scope;
        let r = values.indexOf(itemValue);
        values.splice(r, 1);
        values.splice(itemIndex, 0, itemValue);
        _.each(values, (value, index) => value.order = index);

        return this.repo.saveAll(values);
    }
}
ProjectValuesController.initClass();

//############################################################################
//# Project values directive
//############################################################################

export let ProjectValuesDirective = function($log, $repo, $confirm, $location, animationFrame, $translate, $rootscope, projectService) {
    //# Drag & Drop Link

    let linkDragAndDrop = function($scope, $el, $attrs) {
        let oldParentScope = null;
        let newParentScope = null;
        let itemEl = null;
        let tdom = $el.find(".sortable");

        let drake = dragula([tdom[0]], {
            direction: 'vertical',
            copySortSource: false,
            copy: false,
            mirrorContainer: tdom[0],
            moves(item) { return $(item).is('div[tg-bind-scope]'); }
        });

        drake.on('dragend', function(item) {
            itemEl = $(item);
            let itemValue = itemEl.scope().value;
            let itemIndex = itemEl.index();
            return $scope.$broadcast("admin:project-values:move", itemValue, itemIndex);
        });

        let scroll = autoScroll(window, {
            margin: 20,
            pixels: 30,
            scrollWhenOutside: true,
            autoScroll() {
                return this.down && drake.dragging;
            }
        });

        return $scope.$on("$destroy", function() {
            $el.off();
            return drake.destroy();
        });
    };

    //# Value Link

    let linkValue = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        let valueType = $attrs.type;
        let objName = $attrs.objname;

        let initializeNewValue = () =>
            $scope.newValue = {
                "name": "",
                "is_closed": false,
                "is_archived": false
            }
        ;

        let initializeTextTranslations = () =>
            $scope.addNewElementText = $translate.instant(
                `ADMIN.PROJECT_VALUES_${objName.toUpperCase()}.ACTION_ADD`
            )
        ;

        initializeNewValue();
        initializeTextTranslations();

        $rootscope.$on("$translateChangeEnd", () => $scope.$evalAsync(initializeTextTranslations));

        let goToBottomList = focus => {
            if (focus == null) { focus = false; }
            let table = $el.find(".table-main");

            $(document.body).scrollTop(table.offset().top + table.height());

            if (focus) {
                return $el.find(".new-value input:visible").first().focus();
            }
        };

        let saveValue = function(target) {
            let formEl = target.parents("form");
            let form = formEl.checksley();
            if (!form.validate()) { return; }

            let { value } = formEl.scope();
            let promise = $repo.save(value);
            promise.then(() => {
                let row = target.parents(".row.table-main");
                row.addClass("hidden");
                row.siblings(".visualization").removeClass('hidden');

                return projectService.fetchProject();
            });

            return promise.then(null, data => form.setErrors(data));
        };

        let saveNewValue = function(target) {
            let formEl = target.parents("form");
            let form = formEl.checksley();
            if (!form.validate()) { return; }

            $scope.newValue.project = $scope.project.id;

            $scope.newValue.order = $scope.maxValueOrder ? $scope.maxValueOrder + 1 : 1;

            let promise = $repo.create(valueType, $scope.newValue);
            promise.then(data => {
                target.addClass("hidden");

                $scope.values.push(data);
                $scope.maxValueOrder = data.order;
                return initializeNewValue();
            });

            return promise.then(null, data => form.setErrors(data));
        };

        let cancel = function(target) {
            let row = target.parents(".row.table-main");
            let formEl = target.parents("form");
            let { value } = formEl.scope();
            return $scope.$apply(function() {
                row.addClass("hidden");
                value.revert();
                return row.siblings(".visualization").removeClass('hidden');
            });
        };

        $el.on("click", ".show-add-new", function(event) {
            event.preventDefault();
            $el.find(".new-value").removeClass('hidden');

            return goToBottomList(true);
        });

        $el.on("click", ".add-new", debounce(2000, function(event) {
            event.preventDefault();
            let target = $el.find(".new-value");
            return saveNewValue(target);
        })
        );

        $el.on("click", ".delete-new", function(event) {
            event.preventDefault();
            $el.find(".new-value").addClass("hidden");
            return initializeNewValue();
        });

        $el.on("click", ".edit-value", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);

            let row = target.parents(".row.table-main");
            row.addClass("hidden");

            let editionRow = row.siblings(".edition");
            editionRow.removeClass('hidden');
            return editionRow.find('input:visible').first().focus().select();
        });

        $el.on("keyup", ".new-value input", function(event) {
            if (event.keyCode === 13) {
                let target = $el.find(".new-value");
                return saveNewValue(target);
            } else if (event.keyCode === 27) {
                $el.find(".new-value").addClass("hidden");
                return initializeNewValue();
            }
        });

        $el.on("click", ".save", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return saveValue(target);
        });

        $el.on("click", ".cancel", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return cancel(target);
        });

        return $el.on("click", ".delete-value", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.parents("form");
            let { value } = formEl.scope();

            let choices = {};
            _.each($scope.values, function(option) {
                if (value.id !== option.id) {
                    return choices[option.id] = option.name;
                }
            });

            let subtitle = value.name;

            if (_.keys(choices).length === 0) {
                return $confirm.error($translate.instant("ADMIN.PROJECT_VALUES.ERROR_DELETE_ALL"));
            }

            let title = $translate.instant("ADMIN.COMMON.TITLE_ACTION_DELETE_VALUE");
            let text = $translate.instant("ADMIN.PROJECT_VALUES.REPLACEMENT");

            return $confirm.askChoice(title, subtitle, choices, text).then(function(response) {
                let onSucces = () =>
                    $ctrl.loadValues().finally(() => response.finish())
                ;
                let onError = () => $confirm.notify("error");
                return $repo.remove(value, {"moveTo": response.selected}).then(onSucces, onError);
            });
        });
    };

    let link = function($scope, $el, $attrs) {
        linkDragAndDrop($scope, $el, $attrs);
        linkValue($scope, $el, $attrs);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Color selection directive
//############################################################################

export let ColorSelectionDirective = function() {
    //# Color selection Link

    let link = function($scope, $el, $attrs, $model) {
        $scope.colorList = getDefaulColorList();

        $scope.allowEmpty = false;
        if ($attrs.tgAllowEmpty) {
            $scope.allowEmpty = true;
        }

        let $ctrl = $el.controller();

        $scope.$watch($attrs.ngModel, element => $scope.color = element.color);

        $el.on("click", ".current-color", function(event) {
            // Showing the color selector
            event.preventDefault();
            event.stopPropagation();
            let target = angular.element(event.currentTarget);
            $(".select-color").hide();
            target.siblings(".select-color").show();
            // Hide when click outside
            let body = angular.element("body");
            return body.on("click", event => {
                if (angular.element(event.target).parent(".select-color").length === 0) {
                    $el.find(".select-color").hide();
                    return body.unbind("click");
                }
            });
        });

        $el.on("click", ".select-color .color", function(event) {
            // Selecting one color on color selector
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            $scope.$apply(() => $model.$modelValue.color = target.data("color"));
            return $el.find(".select-color").hide();
        });

        $el.on("click", ".select-color .selected-color", function(event) {
            event.preventDefault();
            $scope.$apply(() => $model.$modelValue.color = $scope.color);
            return $el.find(".select-color").hide();
        });

        $el.on("keyup", "input", function(event) {
            event.stopPropagation();
            if (event.keyCode === 13) {
                $scope.$apply(() => $model.$modelValue.color = $scope.color);
                return $el.find(".select-color").hide();

            } else if (event.keyCode === 27) {
                return $el.find(".select-color").hide();
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
          link,
          require:"ngModel"
      };
};

//############################################################################
//# Custom Attributes Controller
//############################################################################

// Custom attributes types (see taiga-back/taiga/projects/custom_attributes/choices.py)
let TEXT_TYPE = "text";
let MULTILINE_TYPE = "multiline";
let RICHTEXT_TYPE = "richtext";
let DATE_TYPE = "date";
let URL_TYPE = "url";


let TYPE_CHOICES = [
    {
        key: TEXT_TYPE,
        name: "ADMIN.CUSTOM_FIELDS.FIELD_TYPE_TEXT"
    },
    {
        key: MULTILINE_TYPE,
        name: "ADMIN.CUSTOM_FIELDS.FIELD_TYPE_MULTI"
    },
    {
        key: RICHTEXT_TYPE,
        name: "ADMIN.CUSTOM_FIELDS.FIELD_TYPE_RICHTEXT"
    },
    {
        key: DATE_TYPE,
        name: "ADMIN.CUSTOM_FIELDS.FIELD_TYPE_DATE"
    },
    {
        key: URL_TYPE,
        name: "ADMIN.CUSTOM_FIELDS.FIELD_TYPE_URL"
    }
];

export class ProjectCustomAttributesController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    rs:any
    params:any
    q:any
    location:any
    navUrls:any
    appMetaService:any
    translate:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$tgNavUrls",
            "tgAppMetaService",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, rs, params, q, location, navUrls, appMetaService,
                  translate, projectService) {
        super()
        this.loadCustomAttributes = this.loadCustomAttributes.bind(this);
        this.createCustomAttribute = this.createCustomAttribute.bind(this);
        this.saveCustomAttribute = this.saveCustomAttribute.bind(this);
        this.deleteCustomAttribute = this.deleteCustomAttribute.bind(this);
        this.moveCustomAttributes = this.moveCustomAttributes.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        this.scope.TYPE_CHOICES = TYPE_CHOICES;
        this.scope.project = this.projectService.project.toJS();
        this.scope.projectId = this.scope.project.id;

        let sectionName = this.translate.instant(this.scope.sectionName);
        let title = this.translate.instant("ADMIN.CUSTOM_ATTRIBUTES.PAGE_TITLE", {
            "sectionName": sectionName,
            "projectName": this.scope.project.name
        });
        let { description } = this.scope.project;
        this.appMetaService.setAll(title, description);

        this.scope.init = type => {
            this.scope.type = type;
            return this.loadCustomAttributes();
        };
    }

    //########################
    // Custom Attribute
    //########################

    loadCustomAttributes() {
        return this.rs.customAttributes[this.scope.type].list(this.scope.projectId).then(customAttributes => {
            this.scope.customAttributes = customAttributes;
            this.scope.maxOrder = __guard__(_.maxBy(customAttributes, "order"), x => x.order);
            return customAttributes;
        });
    }

    createCustomAttribute(attrValues) {
        return this.repo.create(`custom-attributes/${this.scope.type}`, attrValues);
    }

    saveCustomAttribute(attrModel) {
        return this.repo.save(attrModel);
    }

    deleteCustomAttribute(attrModel) {
        return this.repo.remove(attrModel);
    }

    moveCustomAttributes(attrModel, newIndex) {
        let { customAttributes } = this.scope;
        let r = customAttributes.indexOf(attrModel);
        customAttributes.splice(r, 1);
        customAttributes.splice(newIndex, 0, attrModel);

        _.each(customAttributes, (val, idx) => val.order = idx);

        return this.repo.saveAll(customAttributes);
    }
}
ProjectCustomAttributesController.initClass();

//############################################################################
//# Custom Attributes Directive
//############################################################################

export let ProjectCustomAttributesDirective = function($log, $confirm, animationFrame, $translate) {
    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        $scope.$on("$destroy", () => $el.off());

        //#################################
        // Drag & Drop
        //#################################
        let sortableEl = $el.find(".js-sortable");
        let drake = dragula([sortableEl[0]], {
            direction: 'vertical',
            copySortSource: false,
            copy: false,
            mirrorContainer: sortableEl[0],
            moves(item) { return $(item).is('div[tg-bind-scope]'); }
        });

        drake.on('dragend', function(item) {
            let itemEl = $(item);
            let itemAttr = itemEl.scope().attr;
            let itemIndex = itemEl.index();
            return $ctrl.moveCustomAttributes(itemAttr, itemIndex);
        });

        //#################################
        // New custom attribute
        //#################################

        let showCreateForm = function() {
            $el.find(".js-new-custom-field").removeClass("hidden");
            return $el.find(".js-new-custom-field input:visible").first().focus();
        };

        let hideCreateForm = () => $el.find(".js-new-custom-field").addClass("hidden");

        let showAddButton = () => $el.find(".js-add-custom-field-button").removeClass("hidden");

        let hideAddButton = () => $el.find(".js-add-custom-field-button").addClass("hidden");

        let showCancelButton = () => $el.find(".js-cancel-new-custom-field-button").removeClass("hidden");

        let hideCancelButton = () => $el.find(".js-cancel-new-custom-field-button").addClass("hidden");

        let resetNewAttr = () => $scope.newAttr = {};

        let create = function(formEl) {
            let form = formEl.checksley();
            if (!form.validate()) { return; }

            let onSucces = () => {
                $ctrl.loadCustomAttributes();
                hideCreateForm();
                resetNewAttr();
                return $confirm.notify("success");
            };

            let onError = data => {
                return form.setErrors(data);
            };

            let attr = $scope.newAttr;
            attr.project = $scope.projectId;
            attr.order = $scope.maxOrder ? $scope.maxOrder + 1 : 1;

            return $ctrl.createCustomAttribute(attr).then(onSucces, onError);
        };

        let cancelCreate = function() {
            hideCreateForm();
            return resetNewAttr();
        };

        $scope.$watch("customAttributes", function(customAttributes) {
            if (!customAttributes) { return; }

            if (customAttributes.length === 0) {
                hideCancelButton();
                hideAddButton();
                return showCreateForm();
            } else {
                hideCreateForm();
                showAddButton();
                return showCancelButton();
            }
        });

        $el.on("click", ".js-add-custom-field-button", function(event) {
            event.preventDefault();
            return showCreateForm();
        });

        $el.on("click", ".js-create-custom-field-button", debounce(2000, function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.closest("form");

            return create(formEl);
        })
        );

        $el.on("click", ".js-cancel-new-custom-field-button", function(event) {
            event.preventDefault();
            return cancelCreate();
        });

        $el.on("keyup", ".js-new-custom-field input", function(event) {
            if (event.keyCode === 13) { // Enter
                let target = angular.element(event.currentTarget);
                let formEl = target.closest("form");
                return create(formEl);
            } else if (event.keyCode === 27) { // Esc
                return cancelCreate();
            }
        });

        //#################################
        // Edit custom attribute
        //#################################

        let showEditForm = function(formEl) {
            formEl.find(".js-view-custom-field").addClass("hidden");
            formEl.find(".js-edit-custom-field").removeClass("hidden");
            return formEl.find(".js-edit-custom-field input:visible").first().focus().select();
        };

        let hideEditForm = function(formEl) {
            formEl.find(".js-edit-custom-field").addClass("hidden");
            return formEl.find(".js-view-custom-field").removeClass("hidden");
        };

        let revertChangesInCustomAttribute = formEl =>
            $scope.$apply(() => formEl.scope().attr.revert())
        ;

        let update = function(formEl) {
            let form = formEl.checksley();
            if (!form.validate()) { return; }

            let onSucces = () => {
                $ctrl.loadCustomAttributes();
                hideEditForm(formEl);
                return $confirm.notify("success");
            };

            let onError = data => {
                return form.setErrors(data);
            };

            let { attr } = formEl.scope();
            return $ctrl.saveCustomAttribute(attr).then(onSucces, onError);
        };

        let cancelUpdate = function(formEl) {
            hideEditForm(formEl);
            return revertChangesInCustomAttribute(formEl);
        };

        $el.on("click", ".js-edit-custom-field-button", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.closest("form");

            return showEditForm(formEl);
        });

        $el.on("click", ".js-update-custom-field-button", debounce(2000, function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.closest("form");

            return update(formEl);
        })
        );

        $el.on("click", ".js-cancel-edit-custom-field-button", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.closest("form");

            return cancelUpdate(formEl);
        });

        $el.on("keyup", ".js-edit-custom-field input", function(event) {
            let formEl, target;
            if (event.keyCode === 13) { // Enter
                target = angular.element(event.currentTarget);
                formEl = target.closest("form");
                return update(formEl);
            } else if (event.keyCode === 27) { // Esc
                target = angular.element(event.currentTarget);
                formEl = target.closest("form");
                return cancelUpdate(formEl);
            }
        });

        //#################################
        // Delete custom attribute
        //#################################

        let deleteCustomAttribute = function(formEl) {
            let { attr } = formEl.scope();
            let message = attr.name;

            let title = $translate.instant("COMMON.CUSTOM_ATTRIBUTES.DELETE");
            let text = $translate.instant("COMMON.CUSTOM_ATTRIBUTES.CONFIRM_DELETE");

            return $confirm.ask(title, text, message).then(function(response) {
                let onSucces = () => $ctrl.loadCustomAttributes().finally(() => response.finish());

                let onError = () => $confirm.notify("error", null, `We have not been able to delete '${message}'.`);

                return $ctrl.deleteCustomAttribute(attr).then(onSucces, onError);
            });
        };

        return $el.on("click", ".js-delete-custom-field-button", debounce(2000, function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let formEl = target.closest("form");

            return deleteCustomAttribute(formEl);
        })
        );
    };

    return {link};
};

//############################################################################
//# Tags Controller
//############################################################################

export class ProjectTagsController extends Controller {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    model:any
    projectService:any
    loading:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$tgModel",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, model, projectService) {
        super()
        this.loadTags = this.loadTags.bind(this);
        this.filterAndSortTags = this.filterAndSortTags.bind(this);
        this.createTag = this.createTag.bind(this);
        this.editTag = this.editTag.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
        this.startMixingTags = this.startMixingTags.bind(this);
        this.toggleMixingFromTags = this.toggleMixingFromTags.bind(this);
        this.confirmMixingTags = this.confirmMixingTags.bind(this);
        this.cancelMixingTags = this.cancelMixingTags.bind(this);
        this.mixingClass = this.mixingClass.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.model = model;
        this.projectService = projectService;
        this.loading = true;
        this.loadTags();
    }

    loadTags() {
        let project = this.projectService.project.toJS();
        return this.rs.projects.tagsColors(project.id).then(tags => {
            this.scope.projectTagsAll = _.map(tags.getAttrs(), (color, name) => {
                return this.model.make_model('tag', {name, color});
            });
            this.filterAndSortTags();
            return this.loading = false;
        });
    }

    filterAndSortTags() {
        this.scope.projectTags = _.sortBy(this.scope.projectTagsAll, (it:any) => it.name.toLowerCase());

        return this.scope.projectTags = _.filter(
            this.scope.projectTags,
            (tag:any) => tag.name.indexOf(this.scope.tagsFilter.name) !== -1
        );
    }

    createTag(tag, color) {
        return this.rs.projects.createTag(this.scope.projectId, tag, color);
    }

    editTag(from_tag, to_tag, color) {
        if (from_tag === to_tag) {
            to_tag = null;
        }

        return this.rs.projects.editTag(this.scope.projectId, from_tag, to_tag, color);
    }

    deleteTag(tag) {
        this.scope.loadingDelete = true;
        return this.rs.projects.deleteTag(this.scope.projectId, tag).finally(() => {
            return this.scope.loadingDelete = false;
        });
    }

    startMixingTags(tag) {
        return this.scope.mixingTags.toTag = tag.name;
    }

    toggleMixingFromTags(tag) {
        if (tag.name !== this.scope.mixingTags.toTag) {
            let index = this.scope.mixingTags.fromTags.indexOf(tag.name);
            if (index === -1) {
                return this.scope.mixingTags.fromTags.push(tag.name);
            } else {
                return this.scope.mixingTags.fromTags.splice(index, 1);
            }
        }
    }

    confirmMixingTags() {
        let { toTag } = this.scope.mixingTags;
        let { fromTags } = this.scope.mixingTags;
        this.scope.loadingMixing = true;
        return this.rs.projects.mixTags(this.scope.projectId, toTag, fromTags)
            .then(() => {
                this.cancelMixingTags();
                return this.loadTags();
        }).finally(() => {
                return this.scope.loadingMixing = false;
        });
    }

    cancelMixingTags() {
        this.scope.mixingTags.toTag = null;
        return this.scope.mixingTags.fromTags = [];
    }

    mixingClass(tag) {
        if (this.scope.mixingTags.toTag !== null) {
            if (tag.name === this.scope.mixingTags.toTag) {
                return "mixing-tags-to";
            } else if (this.scope.mixingTags.fromTags.indexOf(tag.name) !== -1) {
                return "mixing-tags-from";
            }
        }
    }
}
ProjectTagsController.initClass();

//############################################################################
//# Tags directive
//############################################################################

export let ProjectTagsDirective = function($log, $repo, $confirm, $location, animationFrame, $translate, $rootscope) {
    let link = function($scope, $el, $attrs) {
        let form, formEl, promise, row, tag;
        let $window = $(window);
        let $ctrl = $el.controller();
        let valueType = $attrs.type;
        let objName = $attrs.objname;

        let initializeNewValue = () =>
            $scope.newValue = {
                "tag": "",
                "color": ""
            }
        ;

        let initializeTagsFilter = () =>
            $scope.tagsFilter = {
                "name": ""
            }
        ;

        let initializeMixingTags = () =>
            $scope.mixingTags = {
                "toTag": null,
                "fromTags": []
            }
        ;

        let initializeTextTranslations = () => $scope.addNewElementText = $translate.instant("ADMIN.PROJECT_VALUES_TAGS.ACTION_ADD");

        initializeNewValue();
        initializeTagsFilter();
        initializeMixingTags();
        initializeTextTranslations();

        $rootscope.$on("$translateChangeEnd", () => $scope.$evalAsync(initializeTextTranslations));

        let goToBottomList = focus => {
            if (focus == null) { focus = false; }
            let table = $el.find(".table-main");

            $(document.body).scrollTop(table.offset().top + table.height());

            if (focus) {
                return $el.find(".new-value input:visible").first().focus();
            }
        };

        let saveValue = target => {
            formEl = target.parents("form");
            form = formEl.checksley();
            if (!form.validate()) { return; }

            ({ tag } = formEl.scope());
            let originalTag = tag.clone();
            originalTag.revert();

            $scope.loadingEdit = true;
            promise = $ctrl.editTag(originalTag.name, tag.name, tag.color);
            promise.then(() => {
                return $ctrl.loadTags().then(() => {
                    row = target.parents(".row.table-main");
                    row.addClass("hidden");
                    $scope.loadingEdit = false;
                    return row.siblings(".visualization").removeClass('hidden');
                });
            });

            return promise.then(null, function(response) {
                $scope.loadingEdit = false;
                return form.setErrors(response.data);
            });
        };

        let saveNewValue = target => {
            formEl = target.parents("form");
            formEl = target;
            form = formEl.checksley();
            if (!form.validate()) { return; }

            $scope.loadingCreate = true;
            promise = $ctrl.createTag($scope.newValue.tag, $scope.newValue.color);
            promise.then(data => {
                return $ctrl.loadTags().then(() => {
                    $scope.loadingCreate = false;
                    target.addClass("hidden");
                    return initializeNewValue();
                });
            });

            return promise.then(null, function(response) {
                $scope.loadingCreate = false;
                return form.setErrors(response.data);
            });
        };

        let cancel = function(target) {
            row = target.parents(".row.table-main");
            formEl = target.parents("form");
            ({ tag } = formEl.scope());

            return $scope.$apply(function() {
                row.addClass("hidden");
                tag.revert();
                return row.siblings(".visualization").removeClass('hidden');
            });
        };

        $scope.$watch("tagsFilter.name", tagsFilter => $ctrl.filterAndSortTags());

        $window.on("keyup", function(event) {
            if (event.keyCode === 27) {
                return $scope.$apply(() => initializeMixingTags());
            }
        });

        $el.on("click", ".show-add-new", function(event) {
            event.preventDefault();
            return $el.find(".new-value").removeClass('hidden');
        });

        $el.on("click", ".add-new", debounce(2000, function(event) {
            event.preventDefault();
            let target = $el.find(".new-value");
            return saveNewValue(target);
        })
        );

        $el.on("click", ".delete-new", function(event) {
            event.preventDefault();
            $el.find(".new-value").addClass("hidden");
            return initializeNewValue();
        });

        $el.on("click", ".mix-tags", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return $scope.$apply(() => $ctrl.startMixingTags(target.parents('form').scope().tag));
        });

        $el.on("click", ".mixing-row", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return $scope.$apply(() => $ctrl.toggleMixingFromTags(target.parents('form').scope().tag));
        });

        $el.on("click", ".mixing-confirm", function(event) {
            event.preventDefault();
            event.stopPropagation();
            return $scope.$apply(() => $ctrl.confirmMixingTags());
        });

        $el.on("click", ".mixing-cancel", function(event) {
            event.preventDefault();
            event.stopPropagation();
            return $scope.$apply(() => $ctrl.cancelMixingTags());
        });

        $el.on("click", ".edit-value", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);

            row = target.parents(".row.table-main");
            row.addClass("hidden");

            let editionRow = row.siblings(".edition");
            editionRow.removeClass('hidden');
            return editionRow.find('input:visible').first().focus().select();
        });

        $el.on("keyup", ".new-value input", function(event) {
            if (event.keyCode === 13) {
                let target = $el.find(".new-value");
                return saveNewValue(target);
            } else if (event.keyCode === 27) {
                $el.find(".new-value").addClass("hidden");
                return initializeNewValue();
            }
        });

        $el.on("keyup", ".status-name input", function(event) {
            let target = angular.element(event.currentTarget);
            if (event.keyCode === 13) {
                return saveValue(target);
            } else if (event.keyCode === 27) {
                return cancel(target);
            }
        });

        $el.on("click", ".save", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return saveValue(target);
        });

        $el.on("click", ".cancel", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return cancel(target);
        });

        $el.on("click", ".delete-tag", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            formEl = target.parents("form");
            ({ tag } = formEl.scope());

            let title = $translate.instant("ADMIN.COMMON.TITLE_ACTION_DELETE_TAG");

            return $confirm.askOnDelete(title, tag.name).then(function(response) {
                let onSucces = () =>
                    $ctrl.loadTags().finally(() => response.finish())
                ;
                let onError = () => $confirm.notify("error");
                return $ctrl.deleteTag(tag.name).then(onSucces, onError);
            });
        });

        return $scope.$on("$destroy", function() {
            $el.off();
            return $window.off();
        });
    };

    return {link};
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
