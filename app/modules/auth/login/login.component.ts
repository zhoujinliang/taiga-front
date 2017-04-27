import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { IState } from "../../../app.store";
import { ConfigurationService } from "../../../ts/modules/base/conf";
import { LoginAction } from "../auth.actions";
import { LoginData } from "../auth.model";

@Component({
    selector: "tg-login-page",
    template: require("./login.jade")(),
})
export class LoginPage {
    nextUrl: string;
    loginErrors: any;

    constructor(private config: ConfigurationService,
                private store: Store<IState>,
                private activeRoute: ActivatedRoute,
                private router: Router) {
        this.nextUrl = "/";
        this.loginErrors = this.store.select((state) => state.getIn(["auth", "login-errors"]));
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
            if (!params["next"] || params["next"] === "/login") {
                this.nextUrl = "/";
            } else {
                this.nextUrl = params["next"];
            }

            if (params["force_next"] && params["force_next"] !== "/login") {
                this.nextUrl = params["force_next"];
            }
        });
    }

    login(loginData: LoginData) {
        this.store.dispatch(new LoginAction(loginData, this.nextUrl));
        return false;
    }
}
