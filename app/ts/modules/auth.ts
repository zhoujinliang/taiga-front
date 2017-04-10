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
 * File: modules/auth.coffee
 */

import {debounce} from "../utils"
import {Service} from "../classes"
import {checksley} from "../libs/checksley"

import * as angular from "angular"
import * as _ from "lodash"
import * as Immutable from "immutable"

let module = angular.module("taigaAuth", ["taigaResources"]);

class LoginPage {
    static initClass() {
        this.$inject = [
            'tgCurrentUserService',
            '$location',
            '$tgNavUrls',
            '$routeParams',
            '$tgAuth'
        ];
    }

    constructor(currentUserService, $location, $navUrls, $routeParams, $auth) {
        if (currentUserService.isAuthenticated()) {
            if (!$routeParams['force_login']) {
                let url = $navUrls.resolve("home");
                if ($routeParams['next']) {
                    url = decodeURIComponent($routeParams['next']);
                    $location.search('next', null);
                }

                if ($routeParams['unauthorized']) {
                    $auth.clear();
                    $auth.removeToken();
                } else {
                    $location.url(url);
                }
            }
        }
    }
}
LoginPage.initClass();


module.controller('LoginPage', LoginPage);

//############################################################################
//# Authentication Service
//############################################################################

class AuthService extends Service {
    rootscope: angular.IScope
    storage:any
    model:any
    rs:any
    http:any
    urls:any
    config:any
    translate:any
    currentUserService:any
    themeService:any
    _currentTheme:any
    userData:any

    static initClass() {
        this.$inject = ["$rootScope",
                     "$tgStorage",
                     "$tgModel",
                     "$tgResources",
                     "$tgHttp",
                     "$tgUrls",
                     "$tgConfig",
                     "$translate",
                     "tgCurrentUserService",
                     "tgThemeService"];
    }

    constructor(rootscope, storage, model, rs, http, urls, config, translate, currentUserService,
                  themeService) {
        super()
        this.rootscope = rootscope;
        this.storage = storage;
        this.model = model;
        this.rs = rs;
        this.http = http;
        this.urls = urls;
        this.config = config;
        this.translate = translate;
        this.currentUserService = currentUserService;
        this.themeService = themeService;
        super();

        let userModel = this.getUser();
        this._currentTheme = this._getUserTheme();

        this.setUserdata(userModel);
    }

    setUserdata(userModel) {
        if (userModel) {
            this.userData = Immutable.fromJS(userModel.getAttrs());
            return this.currentUserService.setUser(this.userData);
        } else {
            return this.userData = null;
        }
    }

    _getUserTheme() {
        return (this.rootscope.user != null ? this.rootscope.user.theme : undefined) || this.config.get("defaultTheme") || "taiga"; // load on index.jade
    }

    _setTheme() {
        let newTheme = this._getUserTheme();

        if (this._currentTheme !== newTheme) {
            this._currentTheme = newTheme;
            return this.themeService.use(this._currentTheme);
        }
    }

    _setLocales() {
        let lang = (this.rootscope.user != null ? this.rootscope.user.lang : undefined) || this.config.get("defaultLanguage") || "en";
        this.translate.preferredLanguage(lang);  // Needed for calls to the api in the correct language
        return this.translate.use(lang);                // Needed for change the interface in runtime
    }

    getUser() {
        if (this.rootscope.user) {
            return this.rootscope.user;
        }

        let userData = this.storage.get("userInfo");

        if (userData) {
            let user = this.model.make_model("users", userData);
            this.rootscope.user = user;
            this._setLocales();

            this._setTheme();

            return user;
        } else {
            this._setTheme();
        }

        return null;
    }

    setUser(user) {
        this.rootscope.auth = user;
        this.storage.set("userInfo", user.getAttrs());
        this.rootscope.user = user;

        this.setUserdata(user);

        this._setLocales();
        return this._setTheme();
    }

    clear() {
        this.rootscope.auth = null;
        this.rootscope.user = null;
        return this.storage.remove("userInfo");
    }

    setToken(token) {
        return this.storage.set("token", token);
    }

    getToken() {
        return this.storage.get("token");
    }

    removeToken() {
        return this.storage.remove("token");
    }

    isAuthenticated() {
        if (this.getUser() !== null) {
            return true;
        }
        return false;
    }

    //# Http interface
    refresh() {
        let url = this.urls.resolve("user-me");

        return this.http.get(url).then((data, status) => {
            let user = data.data;
            user.token = this.getUser().auth_token;

            user = this.model.make_model("users", user);

            this.setUser(user);
            return user;
        });
    }

    login(data, type) {
        let url = this.urls.resolve("auth");

        data = _.clone(data);
        data.type = type ? type : "normal";

        this.removeToken();

        return this.http.post(url, data).then((data, status) => {
            let user = this.model.make_model("users", data.data);
            this.setToken(user.auth_token);
            this.setUser(user);
            return user;
        });
    }

    logout() {
        this.removeToken();
        this.clear();
        this.currentUserService.removeUser();

        this._setTheme();
        return this._setLocales();
    }


    register(data, type, existing) {
        let url = this.urls.resolve("auth-register");

        data = _.clone(data);
        data.type = type ? type : "public";
        if (type === "private") {
            data.existing = existing ? existing : false;
        }

        this.removeToken();

        return this.http.post(url, data).then(response => {
            let user = this.model.make_model("users", response.data);
            this.setToken(user.auth_token);
            this.setUser(user);
            return user;
        });
    }

    getInvitation(token) {
        return this.rs.invitations.get(token);
    }

    acceptInvitiationWithNewUser(data) {
        return this.register(data, "private", false);
    }

    forgotPassword(data) {
        let url = this.urls.resolve("users-password-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changePasswordFromRecovery(data) {
        let url = this.urls.resolve("users-change-password-from-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changeEmail(data) {
        let url = this.urls.resolve("users-change-email");
        data = _.clone(data);
        return this.http.post(url, data);
    }

    cancelAccount(data) {
        let url = this.urls.resolve("users-cancel-account");
        data = _.clone(data);
        return this.http.post(url, data);
    }
}
AuthService.initClass();

module.service("$tgAuth", AuthService);


//############################################################################
//# Login Directive
//############################################################################

// Directive that manages the visualization of public register
// message/link on login page.

let PublicRegisterMessageDirective = function($config, $navUrls, $routeParams, templates) {
    let template = templates.get("auth/login-text.html", true);

    let templateFn = function() {
        let publicRegisterEnabled = $config.get("publicRegisterEnabled");
        if (!publicRegisterEnabled) {
            return "";
        }

        let url = $navUrls.resolve("register");

        if ($routeParams['force_next']) {
            let nextUrl = encodeURIComponent($routeParams['force_next']);
            url += `?next=${nextUrl}`;
        }

        return template({url});
    };

    return {
        restrict: "AE",
        scope: {},
        template: templateFn
    };
};

module.directive("tgPublicRegisterMessage", ["$tgConfig", "$tgNavUrls", "$routeParams",
                                             "$tgTemplate", PublicRegisterMessageDirective]);


let LoginDirective = function($auth, $confirm, $location, $config, $routeParams, $navUrls, $events, $translate, $window) {
    let link = function($scope, $el, $attrs) {
        let form = new checksley.Form($el.find("form.login-form"));

        if ($routeParams['next'] && ($routeParams['next'] !== $navUrls.resolve("login"))) {
            $scope.nextUrl = decodeURIComponent($routeParams['next']);
        } else {
            $scope.nextUrl = $navUrls.resolve("home");
        }

        if ($routeParams['force_next']) {
            $scope.nextUrl = decodeURIComponent($routeParams['force_next']);
        }

        let onSuccess = function(response) {
            $events.setupConnection();

            if ($scope.nextUrl.indexOf('http') === 0) {
                return $window.location.href = $scope.nextUrl;
            } else {
                return $location.url($scope.nextUrl);
            }
        };

        let onError = response => $confirm.notify("light-error", $translate.instant("LOGIN_FORM.ERROR_AUTH_INCORRECT"));

        $scope.onKeyUp = function(event) {
            let target = angular.element(event.currentTarget);
            let value = target.val();
            $scope.iscapsLockActivated = false;
            if (value !== value.toLowerCase()) {
                return $scope.iscapsLockActivated = true;
            }
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let data = {
                "username": $el.find("form.login-form input[name=username]").val(),
                "password": $el.find("form.login-form input[name=password]").val()
            };

            let loginFormType = $config.get("loginFormType", "normal");

            let promise = $auth.login(data, loginFormType);
            return promise.then(onSuccess, onError);
        });

        $el.on("submit", "form", submit);

        (<any>window).prerenderReady = true;

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgLogin", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgConfig", "$routeParams",
                             "$tgNavUrls", "$tgEvents", "$translate", "$window", LoginDirective]);


//############################################################################
//# Register Directive
//############################################################################

let RegisterDirective = function($auth, $confirm, $location, $navUrls, $config, $routeParams, $analytics, $translate, $window) {
    let link = function($scope, $el, $attrs) {
        if (!$config.get("publicRegisterEnabled")) {
            $location.path($navUrls.resolve("not-found"));
            $location.replace();
        }

        $scope.data = {};
        let form = $el.find("form").checksley({onlyOneErrorElement: true});

        if ($routeParams['next'] && ($routeParams['next'] !== $navUrls.resolve("login"))) {
            $scope.nextUrl = decodeURIComponent($routeParams['next']);
        } else {
            $scope.nextUrl = $navUrls.resolve("home");
        }

        let onSuccessSubmit = function(response) {
            $analytics.trackEvent("auth", "register", "user registration", 1);

            if ($scope.nextUrl.indexOf('http') === 0) {
                return $window.location.href = $scope.nextUrl;
            } else {
                return $location.url($scope.nextUrl);
            }
        };

        let onErrorSubmit = function(response) {
            if (response.data._error_message) {
                let text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});
                $confirm.notify("light-error", text);
            }

            return form.setErrors(response.data);
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let promise = $auth.register($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        $scope.$on("$destroy", () => $el.off());

        return (<any>window).prerenderReady = true;
    };

    return {link};
};

module.directive("tgRegister", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgNavUrls", "$tgConfig",
                                "$routeParams", "$tgAnalytics", "$translate", "$window", RegisterDirective]);


//############################################################################
//# Forgot Password Directive
//############################################################################

let ForgotPasswordDirective = function($auth, $confirm, $location, $navUrls, $translate) {
    let link = function($scope, $el, $attrs) {
        $scope.data = {};
        let form = $el.find("form").checksley();

        let onSuccessSubmit = function(response) {
            $location.path($navUrls.resolve("login"));

            let title = $translate.instant("FORGOT_PASSWORD_FORM.SUCCESS_TITLE");
            let message = $translate.instant("FORGOT_PASSWORD_FORM.SUCCESS_TEXT");

            return $confirm.success(title, message);
        };

        let onErrorSubmit = function(response) {
            let text = $translate.instant("FORGOT_PASSWORD_FORM.ERROR");

            return $confirm.notify("light-error", text);
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let promise = $auth.forgotPassword($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        $scope.$on("$destroy", () => $el.off());

        return (<any>window).prerenderReady = true;
    };

    return {link};
};

module.directive("tgForgotPassword", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgNavUrls", "$translate",
                                      ForgotPasswordDirective]);


//############################################################################
//# Change Password from Recovery Directive
//############################################################################

let ChangePasswordFromRecoveryDirective = function($auth, $confirm, $location, $params, $navUrls, $translate) {
    let link = function($scope, $el, $attrs) {
        let text;
        $scope.data = {};

        if ($params.token != null) {
            $scope.tokenInParams = true;
            $scope.data.token = $params.token;
        } else {
            $location.path($navUrls.resolve("login"));

            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.ERROR");
            $confirm.notify("light-error",text);
        }

        let form = $el.find("form").checksley();

        let onSuccessSubmit = function(response) {
            $location.path($navUrls.resolve("login"));

            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.SUCCESS");
            return $confirm.success(text);
        };

        let onErrorSubmit = function(response) {
            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.ERROR");
            return $confirm.notify("light-error", text);
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let promise = $auth.changePasswordFromRecovery($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgChangePasswordFromRecovery", ["$tgAuth", "$tgConfirm", "$tgLocation", "$routeParams",
                                                  "$tgNavUrls", "$translate",
                                                  ChangePasswordFromRecoveryDirective]);


//############################################################################
//# Invitation
//############################################################################

let InvitationDirective = function($auth, $confirm, $location, $config, $params, $navUrls, $analytics, $translate, config) {
    let link = function($scope, $el, $attrs) {
        let data;
        let { token } = $params;

        let promise = $auth.getInvitation(token);
        promise.then(function(invitation) {
            $scope.invitation = invitation;
            return $scope.publicRegisterEnabled = config.get("publicRegisterEnabled");
        });

        promise.then(null, function(response) {
            $location.path($navUrls.resolve("login"));

            let text = $translate.instant("INVITATION_LOGIN_FORM.NOT_FOUND");
            return $confirm.notify("light-error", text);
        });

        // Login form
        $scope.dataLogin = {token};
        let loginForm = $el.find("form.login-form").checksley({onlyOneErrorElement: true});

        let onSuccessSubmitLogin = function(response) {
            $analytics.trackEvent("auth", "invitationAccept", "invitation accept with existing user", 1);
            $location.path($navUrls.resolve("project", {project: $scope.invitation.project_slug}));
            let text = $translate.instant("INVITATION_LOGIN_FORM.SUCCESS", {
                "project_name": $scope.invitation.project_name
            });

            return $confirm.notify("success", text);
        };

        let onErrorSubmitLogin = response => $confirm.notify("light-error", response.data._error_message);

        let submitLogin = debounce(2000, event => {
            event.preventDefault();

            if (!loginForm.validate()) {
                return;
            }

            let loginFormType = $config.get("loginFormType", "normal");
            data = $scope.dataLogin;

            promise = $auth.login({
                username: data.username,
                password: data.password,
                invitation_token: data.token
            }, loginFormType);
            return promise.then(onSuccessSubmitLogin, onErrorSubmitLogin);
        });

        $el.on("submit", "form.login-form", submitLogin);
        $el.on("click", ".button-login", submitLogin);

        // Register form
        $scope.dataRegister = {token};
        let registerForm = $el.find("form.register-form").checksley({onlyOneErrorElement: true});

        let onSuccessSubmitRegister = function(response) {
            $analytics.trackEvent("auth", "invitationAccept", "invitation accept with new user", 1);
            $location.path($navUrls.resolve("project", {project: $scope.invitation.project_slug}));
            return $confirm.notify("success", "You've successfully joined this project",
                                       `Welcome to ${_.escape($scope.invitation.project_name)}`);
        };

        let onErrorSubmitRegister = function(response) {
            if (response.data._error_message) {
                let text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});
                $confirm.notify("light-error", text);
            }

            return registerForm.setErrors(response.data);
        };

        let submitRegister = debounce(2000, event => {
            event.preventDefault();

            if (!registerForm.validate()) {
                return;
            }

            promise = $auth.acceptInvitiationWithNewUser($scope.dataRegister);
            return promise.then(onSuccessSubmitRegister, onErrorSubmitRegister);
        });

        $el.on("submit", "form.register-form", submitRegister);
        $el.on("click", ".button-register", submitRegister);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgInvitation", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgConfig", "$routeParams",
                                  "$tgNavUrls", "$tgAnalytics", "$translate", "$tgConfig", InvitationDirective]);


//############################################################################
//# Change Email
//############################################################################

let ChangeEmailDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
    let link = function($scope, $el, $attrs) {
        $scope.data = {};
        $scope.data.email_token = $params.email_token;
        let form = $el.find("form").checksley();

        let onSuccessSubmit = function(response) {
            if ($auth.isAuthenticated()) {
                $repo.queryOne("users", $auth.getUser().id).then(data => {
                    $auth.setUser(data);
                    $location.path($navUrls.resolve("home"));
                    return $location.replace();
                });
            } else {
                $location.path($navUrls.resolve("login"));
                $location.replace();
            }

            let text = $translate.instant("CHANGE_EMAIL_FORM.SUCCESS");
            return $confirm.success(text);
        };

        let onErrorSubmit = function(response) {
            let text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});

            return $confirm.notify("light-error", text);
        };

        let submit = function() {
            if (!form.validate()) {
                return;
            }

            let promise = $auth.changeEmail($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        };

        $el.on("submit", function(event) {
            event.preventDefault();
            return submit();
        });

        $el.on("click", "a.button-change-email", function(event) {
            event.preventDefault();
            return submit();
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgChangeEmail", ["$tgRepo", "$tgModel", "$tgAuth", "$tgConfirm", "$tgLocation",
                                   "$routeParams", "$tgNavUrls", "$translate", ChangeEmailDirective]);


//############################################################################
//# Cancel account
//############################################################################

let CancelAccountDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
    let link = function($scope, $el, $attrs) {
        $scope.data = {};
        $scope.data.cancel_token = $params.cancel_token;
        let form = $el.find("form").checksley();

        let onSuccessSubmit = function(response) {
            $auth.logout();
            $location.path($navUrls.resolve("home"));

            let text = $translate.instant("CANCEL_ACCOUNT.SUCCESS");

            return $confirm.success(text);
        };

        let onErrorSubmit = function(response) {
            let text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});

            return $confirm.notify("error", text);
        };

        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            let promise = $auth.cancelAccount($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgCancelAccount", ["$tgRepo", "$tgModel", "$tgAuth", "$tgConfirm", "$tgLocation",
                                     "$routeParams","$tgNavUrls", "$translate", CancelAccountDirective]);
