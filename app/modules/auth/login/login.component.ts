import { Component } from "@angular/core"
import { LoginData } from "../auth.model"
import { ActivatedRoute } from "@angular/router"
import { ConfigurationService } from "../../../ts/modules/base/conf";
import { Store } from "@ngrx/store"
import { IState } from "../../../app.store"

@Component({
    selector: "tg-login-page",
    template: require("./login.jade")()
})
export class LoginPage {
    nextUrl: string

    constructor(private config: ConfigurationService,
                private store: Store<IState>,
                private activeRoute: ActivatedRoute) {
        this.nextUrl = "/"
        // if (currentUserService.isAuthenticated()) {
        //     if (!$routeParams['force_login']) {
        //         let url = $navUrls.resolve("home");
        //         if ($routeParams['next']) {
        //             url = decodeURIComponent($routeParams['next']);
        //             $location.search('next', null);
        //         }
        //
        //         if ($routeParams['unauthorized']) {
        //             $auth.clear();
        //             $auth.removeToken();
        //         } else {
        //             $location.url(url);
        //         }
        //     }
        // }
    }

    ngOnInit() {
        this.activeRoute.queryParams.subscribe((params) => {
            if (!params['next'] || params['next'] === "/login") {
                this.nextUrl = "/"
            } else {
                this.nextUrl = params['next']
            }

            if (params['force_next'] && params['force_next'] !== "/login") {
                this.nextUrl = params['force_next']
            }
        });
    }

    login(loginData: LoginData) {
        this.store.dispatch({
            type: "LOGIN",
            payload: loginData
        });
    }
}
