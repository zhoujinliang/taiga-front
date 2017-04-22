import * as Rx from "rxjs/Rx"
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/reduce'
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { SetLoginErrorsAction, SetRegisterErrorAction } from "./home.actions";
import * as Immutable from "immutable";
import {StorageService} from "./../../ts/modules/base/storage"
import { ResourcesService } from "../resources/resources.service";
import { NavigationUrlsService } from "../../ts/modules/base/navurls.service";
import { ConfigurationService } from "../../ts/modules/base/conf";

@Injectable()
export class AuthEffects {
    @Effect()
    fetchAssignedTo$: Observable<Action> = this.actions$
        .oftype('LOGIN')
        .map(topayload)
        .switchmap((loginInfo) => {
            // TODO
        })

    @Effect()
    fetchAssignedTo$: Observable<Action> = this.actions$
        .oftype('REGISTER')
        .map(topayload)
        .switchmap((loginInfo) => {
            // TODO
        })

    constructor(private actions$: Actions,
                private storage: StorageService,
                private config: ConfigurationService,
                private rs: ResourcesService,
                private navurls: NavigationUrlsService) { }
}
