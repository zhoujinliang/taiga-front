import * as Immutable from "immutable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/reduce";
import "rxjs/add/operator/switchMap";
import * as Rx from "rxjs/Rx";

import { go } from "@ngrx/router-store";

import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ConfigurationService } from "../../ts/modules/base/conf";
import { NavigationUrlsService } from "../../ts/modules/base/navurls.service";
import { AddNotificationMessageAction } from "../../ts/modules/common/common.actions";
import { ResourcesService } from "../resources/resources.service";
import {StorageService} from "./../../ts/modules/base/storage";
import * as actions from "./auth.actions";

@Injectable()
export class AuthEffects {
    @Effect()
    storeUser$: Observable<Action> = this.actions$
        .ofType("STORE_USER")
        .map(toPayload)
        .do((user) => {
            if (user) {
                this.storage.set("userInfo", user.toJS());
            } else {
                this.storage.set("userInfo", null);
            }
        })
        .map((user) => new actions.SetUserAction(user));

    @Effect()
    restoreUser$: Observable<Action> = this.actions$
        .ofType("RESTORE_USER")
        .map(() => Immutable.fromJS(this.storage.get("userInfo")))
        .map((user) => new actions.SetUserAction(user));

    @Effect()
    login$: Observable<Action> = this.actions$
        .ofType("LOGIN")
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.user.login(payload.data).flatMap((user: any) => {
                return [
                    new actions.StoreUserAction(user),
                    go([payload.next]),
                ];
            }).catch( (err) => {
                const newError = new AddNotificationMessageAction(
                    "error",
                    this.translate.instant("LOGIN_FORM.ERROR_AUTH_INCORRECT"),
                );
                return Rx.Observable.of(newError);
            });
        });

    @Effect()
    logout$: Observable<Action> = this.actions$
        .ofType("LOGOUT")
        .map(toPayload)
        .flatMap(() => {
            return [
                new actions.StoreUserAction(null),
                go(["/discover"]),
            ];
        });

    @Effect()
    register$: Observable<Action> = this.actions$
        .ofType("REGISTER")
        .map(toPayload);
        // TODO
        // .switchMap((registerInfo:any) => {
        // })

    @Effect()
    passwordRecover$: Observable<Action> = this.actions$
        .ofType("PASSWORD_RECOVER")
        .map(toPayload);
        // TODO
        // .switchMap((registerInfo:any) => {
        // })

    constructor(private actions$: Actions,
                private storage: StorageService,
                private config: ConfigurationService,
                private rs: ResourcesService,
                private navurls: NavigationUrlsService,
                private translate: TranslateService) { }
}
