let CancelAccountDirective = function($repo, $model, $auth, $confirm, $location, $params, $navUrls, $translate) {
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
