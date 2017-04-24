import {Component, OnInit, Output, EventEmitter} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import { FormGroup, FormBuilder, Validators } from "@angular/forms"

import {LoginData} from "../auth.model"
import { ConfigurationService } from "../../../ts/modules/base/conf";

@Component({
    selector: "tg-login-form",
    template: require("./login-form.jade")()
})
export class LoginForm implements OnInit {
    @Output() login: EventEmitter<LoginData>;
    loginForm: FormGroup;
    private queryParams: any;

    constructor(private config: ConfigurationService,
                private fb: FormBuilder,
                private activeRoute: ActivatedRoute) {
        this.login = new EventEmitter();
        this.loginForm = this.fb.group({
            "username": ['', Validators.required],
            "password": ['', Validators.required],
            "type": "normal",
        })
    }

    ngOnInit() {
        this.activeRoute.queryParams.subscribe((params) => {
            this.queryParams = params
        })
    }

    onSubmit():boolean {
        this.login.emit(this.loginForm.value);
        return false;
    }
}
// let LoginDirective = function($auth, $confirm, $location, $config, $routeParams, $navUrls, $events, $translate, $window) {
//
//     onSubmit() {
//         this.submit.emit(this.loginForm.data)
//     }
//
//     let link = function($scope, $el, $attrs) {
//         let form = new checksley.Form($el.find("form.login-form"));
//
//         if ($routeParams['next'] && ($routeParams['next'] !== $navUrls.resolve("login"))) {
//             $scope.nextUrl = decodeURIComponent($routeParams['next']);
//         } else {
//             $scope.nextUrl = $navUrls.resolve("home");
//         }
//
//         if ($routeParams['force_next']) {
//             $scope.nextUrl = decodeURIComponent($routeParams['force_next']);
//         }
//
//         let onSuccess = function(response) {
//             $events.setupConnection();
//
//             if ($scope.nextUrl.indexOf('http') === 0) {
//                 return $window.location.href = $scope.nextUrl;
//             } else {
//                 return $location.url($scope.nextUrl);
//             }
//         };
//
//         let onError = response => $confirm.notify("light-error", $translate.instant("LOGIN_FORM.ERROR_AUTH_INCORRECT"));
//
//         $scope.onKeyUp = function(event) {
//             let target = angular.element(event.currentTarget);
//             let value = target.val();
//             $scope.iscapsLockActivated = false;
//             if (value !== value.toLowerCase()) {
//                 return $scope.iscapsLockActivated = true;
//             }
//         };
//
//         // let submit = debounce(2000, event => {
//         //     event.preventDefault();
//         //
//         //     if (!form.validate()) {
//         //         return;
//         //     }
//         //
//         //     let data = {
//         //         "username": $el.find("form.login-form input[name=username]").val(),
//         //         "password": $el.find("form.login-form input[name=password]").val()
//         //     };
//         //
//         //     let loginFormType = $config.get("loginFormType", "normal");
//         //
//         //     let stream = $auth.login(data, loginFormType);
//         //     return stream.subscrie(onSuccess, onError);
//         // });
//
//         (<any>window).prerenderReady = true;
//     };
// };
