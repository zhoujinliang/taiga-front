import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ConfigurationService } from "../../../ts/modules/base/conf";
import { Store } from "@ngrx/store"
import { IState } from "../../../app.store"

@Component({
    selector: "tg-forgot-password-page",
    template: require("./forgot-password.jade")()
})
export class ForgotPasswordPage {
    nextUrl: string

    constructor(private config: ConfigurationService,
                private store: Store<IState>,
                private activeRoute: ActivatedRoute) {
        this.nextUrl = "/"
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

    passwordRecover(email: string) {
        this.store.dispatch({
            type: "PASSWORD_RECOVER",
            payload: email
        });
    }
}
