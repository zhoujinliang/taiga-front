import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import * as Immutable from "immutable";
import * as _ from "lodash";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ResourcesService } from "../resources/resources.service";
import * as actions from "./user-settings.actions";
import {SetUserAction} from "../auth/auth.actions";
import {AddNotificationMessageAction} from "../../ts/modules/common/common.actions";

@Injectable()
export class UserSettingsEffects {
    @Effect()
    fetchUserSettingsLanguages$: Observable<Action> = this.actions$
        .ofType("FETCH_USER_SETTINGS_LANGUAGES")
        .switchMap(() => {
          return this.rs.locales.list().map((result) => {
              return new actions.SetUserSettingsLanguagesAction(result.data);
          });
        });

    @Effect()
    fetchUserSettingsNotifyPolicies$: Observable<Action> = this.actions$
        .ofType("FETCH_USER_SETTINGS_NOTIFY_POLICIES")
        .switchMap(() => {
          return this.rs.notifyPolicies.list().map((result) => {
              return new actions.SetUserSettingsNotifyPoliciesAction(result.data);
          });
        });

    @Effect()
    updateUserSettingsData$: Observable<Action> = this.actions$
        .ofType("UPDATE_USER_SETTINGS_DATA")
        .map(toPayload)
        .switchMap((payload) => {
          return this.rs.user.update(payload.userId, payload.userData).map((result) => {
              return new SetUserAction(result.data);
          }).catch((err): Observable<Action> => {
              if (err.status == 400) {
                  let errData = Immutable.fromJS(err.json());
                  if (errData.get('_error_message')) {
                      return Observable.of(new AddNotificationMessageAction("error", errData.get('_error_message')));
                  } else {
                      return Observable.of(new actions.SetUserSettingsFormErrorsAction(errData));
                  }
              } else {
                  return Observable.of(new AddNotificationMessageAction("error"));
              }
          });
        });

    constructor(private actions$: Actions, private rs: ResourcesService) { }
}
