import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { IState } from "../../../app.store";
import { ConfigurationService } from "../../../ts/modules/base/conf";
import { LoginAction } from "../auth.actions";
import { LoginData } from "../auth.model";
import { Observable, Subscription } from "rxjs"
import { go } from "@ngrx/router-store";

import * as Immutable from "immutable";

@Component({
    selector: "tg-login-page",
    template: require("./login.pug")(),
})
export class LoginPage implements OnInit, OnDestroy {
    nextUrl: string;
    loginErrors: Observable<Immutable.Map<string, any>>;
    currentUser: Observable<Immutable.Map<string, any>>;
    subscriptions: Subscription[];

    constructor(private config: ConfigurationService,
                private store: Store<IState>,
                private activeRoute: ActivatedRoute,
                private router: Router) {
        this.nextUrl = "/";
        this.loginErrors = this.store.select((state) => state.getIn(["auth", "login-errors"]));
        this.currentUser = this.store.select((state) => state.getIn(["auth", "user"]));
    }

    calculateNextUrl(next, forceNext) {
        if (forceNext && forceNext !== "/login") {
            return forceNext;
        }

        if (next && next !== "/login") {
            return next;
        }

        return "/";
    }

    ngOnInit() {
        this.subscriptions = [
            this.currentUser.combineLatest(this.activeRoute.queryParams).subscribe(([currentUser, params]) => {
                this.nextUrl = this.calculateNextUrl(params['next'], params['force_next']);
                if (currentUser) {
                    this.store.dispatch(go(this.nextUrl));
                }
                return this.nextUrl
            }),
        ]
    }

    login(loginData: LoginData) {
        this.store.dispatch(new LoginAction(loginData, this.nextUrl));
        return false;
    }

    ngOnDestroy() {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
