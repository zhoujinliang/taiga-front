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

