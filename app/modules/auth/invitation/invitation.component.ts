import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { IState } from "../../../app.store";
import { ConfigurationService } from "../../../ts/modules/base/conf";
import { LoginAction, RegisterAction, FetchInvitationAction } from "../auth.actions";
import { LoginData, RegisterData } from "../auth.model";
import { Observable, Subscription } from "rxjs"
import { CloseLightboxAction, SetMetadataAction } from "../../../app.actions";
import { go } from "@ngrx/router-store";
import { calculateNextUrl } from "../utils";

import * as Immutable from "immutable";

@Component({
    selector: "tg-invitation-page",
    template: require("./invitation.pug")(),
})
export class InvitationPage implements OnInit, OnDestroy {
    invitation: Immutable.Map<string, any>;
    subscriptions: Subscription[];

    constructor(private config: ConfigurationService,
                private store: Store<IState>,
                private activeRoute: ActivatedRoute,
                private router: Router) {
        this.store.dispatch(new SetMetadataAction("INVITATION.PAGE_TITLE", {}, "INVITATION.PAGE_DESCRIPTION", {}))
    }

    ngOnInit() {
        this.subscriptions = [
            this.activeRoute.params.subscribe(({uuid}) => {
                this.store.dispatch(new FetchInvitationAction(uuid));
            }),
            this.store.select((state) => state.getIn(["auth", "invitation"])).subscribe((invitation) => {
                this.invitation = invitation;
            })

        ]
    }

    onLogin(loginData: LoginData) {
        this.store.dispatch(new LoginAction(loginData, null));
        return false;
    }

    onRegister(registerData: RegisterData) {
        this.store.dispatch(new RegisterAction(registerData, null));
        return false;
    }

    ngOnDestroy() {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
