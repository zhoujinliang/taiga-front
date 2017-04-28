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

import {checksley} from "../libs/checksley";

import {Service} from "../classes";
import {debounce} from "../utils";

import * as angular from "angular";
import * as Immutable from "immutable";
import * as _ from "lodash";

import {Injectable} from "@angular/core";
import {downgradeInjectable} from "@angular/upgrade/static";
import {TranslateService} from "@ngx-translate/core";
import {CurrentUserService} from "../../modules/services/current-user.service";
import {GlobalDataService} from "../../modules/services/global-data.service";
import {ThemeService} from "../../modules/services/theme.service";
import {ConfigurationService} from "./base/conf";
import {HttpService} from "./base/http";
import {ModelService} from "./base/model";
import {StorageService} from "./base/storage";
import {UrlsService} from "./base/urls";

const module = angular.module("taigaAuth", ["taigaResources"]);

class LoginPage {
    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "$location",
            "$tgNavUrls",
            "$routeParams",
            "$tgAuth",
        ];
    }

    constructor(currentUserService, $location, $navUrls, $routeParams, $auth) {
        if (currentUserService.isAuthenticated()) {
            if (!$routeParams["force_login"]) {
                let url = $navUrls.resolve("home");
                if ($routeParams["next"]) {
                    url = decodeURIComponent($routeParams["next"]);
                    $location.search("next", null);
                }

                if ($routeParams["unauthorized"]) {
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

module.controller("LoginPage", LoginPage);

//############################################################################
//# Authentication Service
//############################################################################

@Injectable()
export class AuthService {
    _currentTheme: any;
    userData: any;

    constructor(private globalData: GlobalDataService,
                private storage: StorageService,
                private model: ModelService,
                private http: HttpService,
                private urls: UrlsService,
                private config: ConfigurationService,
                private translate: TranslateService,
                private currentUser: CurrentUserService,
                private theme: ThemeService) {
        const userModel = this.getUser();
        this._currentTheme = this._getUserTheme();

        this.setUserdata(userModel);
    }

    setUserdata(userModel) {
        if (userModel) {
            this.userData = Immutable.fromJS(userModel.getAttrs());
            return this.currentUser.setUser(this.userData);
        } else {
            return this.userData = null;
        }
    }

    _getUserTheme() {
        return (this.globalData.get("user") != null && this.globalData.get("user").theme) || this.config.get("defaultTheme") || "taiga"; // load on index.jade
    }

    _setTheme() {
        const newTheme = this._getUserTheme();

        if (this._currentTheme !== newTheme) {
            this._currentTheme = newTheme;
            return this.theme.use(this._currentTheme);
        }
    }

    _setLocales() {
        const lang = (this.globalData.get("user") != null && this.globalData.get("user").lang) || this.config.get("defaultLanguage") || "en";
        this.translate.setDefaultLang(lang);  // Needed for calls to the api in the correct language
        return this.translate.use(lang);                // Needed for change the interface in runtime
    }

    getUser() {
        if (this.globalData.get("user")) {
            return this.globalData.get("user");
        }

        const userData = this.storage.get("userInfo");

        if (userData) {
            const user = this.model.make_model("users", userData);
            this.globalData.set("user", user);
            this._setLocales();
            this._setTheme();
            return user;
        } else {
            this._setTheme();
        }

        return null;
    }

    setUser(user) {
        this.globalData.set("auth", user);
        this.storage.set("userInfo", user.getAttrs());
        this.globalData.set("user", user);

        this.setUserdata(user);

        this._setLocales();
        return this._setTheme();
    }

    clear() {
        this.globalData.unset("auth");
        this.globalData.unset("user");
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
        const url = this.urls.resolve("user-me");

        return this.http.get(url).subscribe((data: any) => {
            let user = data.data;
            user.token = this.getUser().auth_token;

            user = this.model.make_model("users", user);

            this.setUser(user);
            return user;
        });
    }

    login(data, type) {
        const url = this.urls.resolve("auth");

        data = _.clone(data);
        data.type = type ? type : "normal";

        this.removeToken();

        return this.http.post(url, data).subscribe((data: any) => {
            const user = this.model.make_model("users", data.data);
            this.setToken((user as any).auth_token);
            this.setUser(user);
            return user;
        });
    }

    logout() {
        this.removeToken();
        this.clear();
        this.currentUser.removeUser();

        this._setTheme();
        return this._setLocales();
    }

    register(data, type, existing) {
        const url = this.urls.resolve("auth-register");

        data = _.clone(data);
        data.type = type ? type : "public";
        if (type === "private") {
            data.existing = existing ? existing : false;
        }

        this.removeToken();

        return this.http.post(url, data).subscribe((response: any) => {
            const user = this.model.make_model("users", response.data);
            this.setToken((user as any).auth_token);
            this.setUser(user);
            return user;
        });
    }

    acceptInvitiationWithNewUser(data) {
        return this.register(data, "private", false);
    }

    forgotPassword(data) {
        const url = this.urls.resolve("users-password-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changePasswordFromRecovery(data) {
        const url = this.urls.resolve("users-change-password-from-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changeEmail(data) {
        const url = this.urls.resolve("users-change-email");
        data = _.clone(data);
        return this.http.post(url, data);
    }

    cancelAccount(data) {
        const url = this.urls.resolve("users-cancel-account");
        data = _.clone(data);
        return this.http.post(url, data);
    }
}

module.service("$tgAuth", downgradeInjectable(AuthService));

//############################################################################
//# Login Directive
//############################################################################

// Directive that manages the visualization of public register
// message/link on login page.

const PublicRegisterMessageDirective = function($config, $navUrls, $routeParams, templates) {
    const template = templates.get("auth/login-text.html", true);

    const templateFn = function() {
        const publicRegisterEnabled = $config.get("publicRegisterEnabled");
        if (!publicRegisterEnabled) {
            return "";
        }

        let url = $navUrls.resolve("register");

        if ($routeParams["force_next"]) {
            const nextUrl = encodeURIComponent($routeParams["force_next"]);
            url += `?next=${nextUrl}`;
        }

        return template({url});
    };

    return {
        restrict: "AE",
        scope: {},
        template: templateFn,
    };
};

module.directive("tgPublicRegisterMessage", ["$tgConfig", "$tgNavUrls", "$routeParams",
                                             "$tgTemplate", PublicRegisterMessageDirective]);

const LoginDirective = function($auth, $confirm, $location, $config, $routeParams, $navUrls, $events, $translate, $window) {
    const link = function($scope, $el, $attrs) {
        const form = new checksley.Form($el.find("form.login-form"));

        if ($routeParams["next"] && ($routeParams["next"] !== $navUrls.resolve("login"))) {
            $scope.nextUrl = decodeURIComponent($routeParams["next"]);
        } else {
            $scope.nextUrl = $navUrls.resolve("home");
        }

        if ($routeParams["force_next"]) {
            $scope.nextUrl = decodeURIComponent($routeParams["force_next"]);
        }

        const onSuccess = function(response) {
            $events.setupConnection();

            if ($scope.nextUrl.indexOf("http") === 0) {
                return $window.location.href = $scope.nextUrl;
            } else {
                return $location.url($scope.nextUrl);
            }
        };

        const onError = (response) => $confirm.notify("light-error", $translate.instant("LOGIN_FORM.ERROR_AUTH_INCORRECT"));

        $scope.onKeyUp = function(event) {
            const target = angular.element(event.currentTarget);
            const value = target.val();
            $scope.iscapsLockActivated = false;
            if (value !== value.toLowerCase()) {
                return $scope.iscapsLockActivated = true;
            }
        };

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            const data = {
                username: $el.find("form.login-form input[name=username]").val(),
                password: $el.find("form.login-form input[name=password]").val(),
            };

            const loginFormType = $config.get("loginFormType", "normal");

            const stream = $auth.login(data, loginFormType);
            return stream.subscrie(onSuccess, onError);
        });

        $el.on("submit", "form", submit);

        (window as any).prerenderReady = true;

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgLogin", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgConfig", "$routeParams",
                             "$tgNavUrls", "$tgEvents", "$translate", "$window", LoginDirective]);

//############################################################################
//# Register Directive
//############################################################################

const RegisterDirective = function($auth, $confirm, $location, $navUrls, $config, $routeParams, $analytics, $translate, $window) {
    const link = function($scope, $el, $attrs) {
        if (!$config.get("publicRegisterEnabled")) {
            $location.path($navUrls.resolve("not-found"));
            $location.replace();
        }

        $scope.data = {};
        const form = $el.find("form").checksley({onlyOneErrorElement: true});

        if ($routeParams["next"] && ($routeParams["next"] !== $navUrls.resolve("login"))) {
            $scope.nextUrl = decodeURIComponent($routeParams["next"]);
        } else {
            $scope.nextUrl = $navUrls.resolve("home");
        }

        const onSuccessSubmit = function(response) {
            $analytics.trackEvent("auth", "register", "user registration", 1);

            if ($scope.nextUrl.indexOf("http") === 0) {
                return $window.location.href = $scope.nextUrl;
            } else {
                return $location.url($scope.nextUrl);
            }
        };

        const onErrorSubmit = function(response) {
            if (response.data._error_message) {
                const text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});
                $confirm.notify("light-error", text);
            }

            return form.setErrors(response.data);
        };

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            const promise = $auth.register($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        $scope.$on("$destroy", () => $el.off());

        return (window as any).prerenderReady = true;
    };

    return {link};
};

module.directive("tgRegister", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgNavUrls", "$tgConfig",
                                "$routeParams", "$tgAnalytics", "$translate", "$window", RegisterDirective]);

//############################################################################
//# Forgot Password Directive
//############################################################################

const ForgotPasswordDirective = function($auth, $confirm, $location, $navUrls, $translate) {
    const link = function($scope, $el, $attrs) {
        $scope.data = {};
        const form = $el.find("form").checksley();

        const onSuccessSubmit = function(response) {
            $location.path($navUrls.resolve("login"));

            const title = $translate.instant("FORGOT_PASSWORD_FORM.SUCCESS_TITLE");
            const message = $translate.instant("FORGOT_PASSWORD_FORM.SUCCESS_TEXT");

            return $confirm.success(title, message);
        };

        const onErrorSubmit = function(response) {
            const text = $translate.instant("FORGOT_PASSWORD_FORM.ERROR");

            return $confirm.notify("light-error", text);
        };

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            const promise = $auth.forgotPassword($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        $scope.$on("$destroy", () => $el.off());

        return (window as any).prerenderReady = true;
    };

    return {link};
};

module.directive("tgForgotPassword", ["$tgAuth", "$tgConfirm", "$tgLocation", "$tgNavUrls", "$translate",
                                      ForgotPasswordDirective]);

//############################################################################
//# Change Password from Recovery Directive
//############################################################################

const ChangePasswordFromRecoveryDirective = function($auth, $confirm, $location, $params, $navUrls, $translate) {
    const link = function($scope, $el, $attrs) {
        let text;
        $scope.data = {};

        if ($params.token != null) {
            $scope.tokenInParams = true;
            $scope.data.token = $params.token;
        } else {
            $location.path($navUrls.resolve("login"));

            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.ERROR");
            $confirm.notify("light-error", text);
        }

        const form = $el.find("form").checksley();

        const onSuccessSubmit = function(response) {
            $location.path($navUrls.resolve("login"));

            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.SUCCESS");
            return $confirm.success(text);
        };

        const onErrorSubmit = function(response) {
            text = $translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.ERROR");
            return $confirm.notify("light-error", text);
        };

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            const promise = $auth.changePasswordFromRecovery($scope.data);
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

const InvitationDirective = function($auth, $rs, $confirm, $location, $config, $params, $navUrls, $analytics, $translate, config) {
    const link = function($scope, $el, $attrs) {
        let data;
        const { token } = $params;

        let promise = $rs.invitations.get(token);
        promise.then(function(invitation) {
            $scope.invitation = invitation;
            return $scope.publicRegisterEnabled = config.get("publicRegisterEnabled");
        });

        promise.then(null, function(response) {
            $location.path($navUrls.resolve("login"));

            const text = $translate.instant("INVITATION_LOGIN_FORM.NOT_FOUND");
            return $confirm.notify("light-error", text);
        });

        // Login form
        $scope.dataLogin = {token};
        const loginForm = $el.find("form.login-form").checksley({onlyOneErrorElement: true});

        const onSuccessSubmitLogin = function(response) {
            $analytics.trackEvent("auth", "invitationAccept", "invitation accept with existing user", 1);
            $location.path($navUrls.resolve("project", {project: $scope.invitation.project_slug}));
            const text = $translate.instant("INVITATION_LOGIN_FORM.SUCCESS", {
                project_name: $scope.invitation.project_name,
            });

            return $confirm.notify("success", text);
        };

        const onErrorSubmitLogin = (response) => $confirm.notify("light-error", response.data._error_message);

        const submitLogin = debounce(2000, (event) => {
            event.preventDefault();

            if (!loginForm.validate()) {
                return;
            }

            const loginFormType = $config.get("loginFormType", "normal");
            data = $scope.dataLogin;

            promise = $auth.login({
                username: data.username,
                password: data.password,
                invitation_token: data.token,
            }, loginFormType);
            return promise.then(onSuccessSubmitLogin, onErrorSubmitLogin);
        });

        $el.on("submit", "form.login-form", submitLogin);
        $el.on("click", ".button-login", submitLogin);

        // Register form
        $scope.dataRegister = {token};
        const registerForm = $el.find("form.register-form").checksley({onlyOneErrorElement: true});

        const onSuccessSubmitRegister = function(response) {
            $analytics.trackEvent("auth", "invitationAccept", "invitation accept with new user", 1);
            $location.path($navUrls.resolve("project", {project: $scope.invitation.project_slug}));
            return $confirm.notify("success", "You've successfully joined this project",
                                       `Welcome to ${_.escape($scope.invitation.project_name)}`);
        };

        const onErrorSubmitRegister = function(response) {
            if (response.data._error_message) {
                const text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});
                $confirm.notify("light-error", text);
            }

            return registerForm.setErrors(response.data);
        };

        const submitRegister = debounce(2000, (event) => {
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

module.directive("tgInvitation", ["$tgAuth", "$tgResources", "$tgConfirm", "$tgLocation", "$tgConfig", "$routeParams",
                                  "$tgNavUrls", "$tgAnalytics", "$translate", "$tgConfig", InvitationDirective]);

//############################################################################
//# Change Email
//############################################################################

const ChangeEmailDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
    const link = function($scope, $el, $attrs) {
        $scope.data = {};
        $scope.data.email_token = $params.email_token;
        const form = $el.find("form").checksley();

        const onSuccessSubmit = function(response) {
            if ($auth.isAuthenticated()) {
                $repo.queryOne("users", $auth.getUser().id).then((data) => {
                    $auth.setUser(data);
                    $location.path($navUrls.resolve("home"));
                    return $location.replace();
                });
            } else {
                $location.path($navUrls.resolve("login"));
                $location.replace();
            }

            const text = $translate.instant("CHANGE_EMAIL_FORM.SUCCESS");
            return $confirm.success(text);
        };

        const onErrorSubmit = function(response) {
            const text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});

            return $confirm.notify("light-error", text);
        };

        const submit = function() {
            if (!form.validate()) {
                return;
            }

            const promise = $auth.changeEmail($scope.data);
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

const CancelAccountDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
    const link = function($scope, $el, $attrs) {
        $scope.data = {};
        $scope.data.cancel_token = $params.cancel_token;
        const form = $el.find("form").checksley();

        const onSuccessSubmit = function(response) {
            $auth.logout();
            $location.path($navUrls.resolve("home"));

            const text = $translate.instant("CANCEL_ACCOUNT.SUCCESS");

            return $confirm.success(text);
        };

        const onErrorSubmit = function(response) {
            const text = $translate.instant("COMMON.GENERIC_ERROR", {error: response.data._error_message});

            return $confirm.notify("error", text);
        };

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            const promise = $auth.cancelAccount($scope.data);
            return promise.then(onSuccessSubmit, onErrorSubmit);
        });

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgCancelAccount", ["$tgRepo", "$tgModel", "$tgAuth", "$tgConfirm", "$tgLocation",
                                     "$routeParams", "$tgNavUrls", "$translate", CancelAccountDirective]);
