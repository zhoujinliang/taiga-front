import * as Immutable from "immutable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/reduce";
import "rxjs/add/operator/switchMap";
import {Observable} from "rxjs";

import { go } from "@ngrx/router-store";
import { OpenLightboxAction } from "../../app.actions";

import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ConfigurationService } from "../../ts/modules/base/conf";
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
    fetchInvitation$: Observable<Action> = this.actions$
        .ofType("FETCH_INVITATION")
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.invitations.get(payload).map((invitation) => {
                return new actions.SetInvitationAction(invitation.data);
            })
        });

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
                return Observable.of(newError);
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
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.user.register(payload.data).flatMap((user: any) => {
                return [
                    new actions.StoreUserAction(user),
                    go([payload.next]),
                ];
            }).catch( (err) => {
                const newError = new AddNotificationMessageAction(
                    "error",
                    this.translate.instant(err.data.get('_error_message')),
                );
                return Observable.of(newError);
            });
        });

    @Effect()
    passwordRecover$: Observable<Action> = this.actions$
        .ofType("PASSWORD_RECOVER")
        .map(toPayload)
        .switchMap((username) => {
            return this.rs.user.passwordRecover(username).flatMap(() => {
                return [
                    new OpenLightboxAction("auth.password-recover"),
                    go(["/login"]),
                ];
            }).catch( (err) => {
                const newError = new AddNotificationMessageAction(
                    "error",
                    this.translate.instant("FORGOT_PASSWORD_FORM.ERROR"),
                );
                return Observable.of(newError);
            });
        });

    @Effect()
    changePasswordFromRecovery: Observable<Action> = this.actions$
        .ofType("CHANGE_PASSWORD_FROM_RECOVERY")
        .map(toPayload)
        .switchMap(({password, uuid}) => {
            return this.rs.user.changePasswordFromRecovery(password, uuid).flatMap(() => {
                return [
                    new OpenLightboxAction("auth.password-recover-from-recovery"),
                    go(["/login"]),
                ];
            }).catch( (err) => {
                const newError = new AddNotificationMessageAction(
                    "error",
                    this.translate.instant("CHANGE_PASSWORD_RECOVERY_FORM.ERROR"),
                );
                return Observable.of(newError);
            });
        });

    constructor(private actions$: Actions,
                private storage: StorageService,
                private config: ConfigurationService,
                private rs: ResourcesService,
                private translate: TranslateService) { }
}
