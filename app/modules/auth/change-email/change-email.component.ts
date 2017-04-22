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


