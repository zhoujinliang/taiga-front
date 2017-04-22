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

