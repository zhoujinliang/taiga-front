import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { SetUserAction, SetProjectsAction } from "./app.actions";
import * as Immutable from "immutable";
import {StorageService} from "./ts/modules/base/storage"
import { ResourcesService } from "./modules/resources/resources.service";

@Injectable()
export class GlobalEffects {
    @Effect()
    fetchCurrentUser$: Observable<Action> = this.actions$
        .ofType('FETCH_CURRENT_USER_DATA')
        .switchMap(() => {
          let user = Immutable.fromJS(this.storage.get("userInfo"));
          console.log(user);
          let userId = null;
          if (user && user.get('id')) {
              userId = user.get('id');
          }
          return this.rs.projects.getProjectsByUserId(userId).flatMap((projects) => {
              return [
                  new SetUserAction(user),
                  new SetProjectsAction(projects)
              ]
          });
        });

    @Effect()
    storeUser$: Observable<Action> = this.actions$
        .ofType('STORE_USER')
        .map(toPayload)
        .map((user) => {
            if(user) {
                this.storage.set("userInfo", user.toJS());
            } else {
                this.storage.set("userInfo", {});
            }
            return new SetUserAction(user);
        });

    constructor(private storage: StorageService, private rs: ResourcesService, private actions$: Actions) {}
}
