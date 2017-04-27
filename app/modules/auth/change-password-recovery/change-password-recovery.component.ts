let ChangePasswordFromRecoveryDirective = function($auth, $confirm, $location, $params, $navUrls, $translate) {
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
