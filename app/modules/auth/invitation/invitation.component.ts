let InvitationDirective = function($auth, $rs, $confirm, $location, $config, $params, $navUrls, $analytics, $translate, config) {
    let link = function($scope, $el, $attrs) {
        let data;
        let { token } = $params;

        let promise = $rs.invitations.get(token);
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

