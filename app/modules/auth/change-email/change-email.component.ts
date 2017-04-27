let ChangeEmailDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
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
