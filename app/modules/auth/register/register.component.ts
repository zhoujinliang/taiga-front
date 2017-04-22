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

