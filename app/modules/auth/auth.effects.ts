import * as Rx from "rxjs/Rx"
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/reduce'
import * as Immutable from "immutable";

import { go } from '@ngrx/router-store';

import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { SetLoginErrorsAction, SetRegisterErrorsAction } from "./auth.actions";
import { SetUserAction } from "../../app.actions";
import { AddNotificationMessageAction } from "../../ts/modules/common/common.actions";
import {StorageService} from "./../../ts/modules/base/storage"
import { ResourcesService } from "../resources/resources.service";
import { NavigationUrlsService } from "../../ts/modules/base/navurls.service";
import { ConfigurationService } from "../../ts/modules/base/conf";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class AuthEffects {
    @Effect()
    storeUser$: Observable<Action> = this.actions$
        .ofType('STORE_USER')
        .map(toPayload)
        .do((user) => this.storage.set('userInfo', user.toJS()))
        .map((user) => new SetUserAction(user));

    @Effect()
    restoreUser$: Observable<Action> = this.actions$
        .ofType('RESTORE_USER')
        .map(() => this.storage.get('userInfo'))
        .map((user) => new SetUserAction(user));

    @Effect()
    login$: Observable<Action> = this.actions$
        .ofType('LOGIN')
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.user.login(payload.data).flatMap((user:any) => {
                return [
                    new SetUserAction(user),
                    go([payload.next])
                ]
            }).catch( (err) => {
                let newError = new AddNotificationMessageAction({
                    type: "error",
                    message: this.translate.instant("LOGIN_FORM.ERROR_AUTH_INCORRECT"),
                });
                return Rx.Observable.of(newError);
            })
        });

    @Effect()
    register$: Observable<Action> = this.actions$
        .ofType('REGISTER')
        .map(toPayload)
        // TODO
        // .switchMap((registerInfo:any) => {
        // })

    @Effect()
    passwordRecover$: Observable<Action> = this.actions$
        .ofType('PASSWORD_RECOVER')
        .map(toPayload)
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
