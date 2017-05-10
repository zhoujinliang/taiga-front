import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class FetchLanguagesAction implements Action {
  readonly type = "FETCH_USER_SETTINGS_LANGUAGES";
  public payload = null;
}

export class FetchNotifyPoliciesAction implements Action {
  readonly type = "FETCH_USER_SETTINGS_NOTIFY_POLICIES";
  public payload = null;
}

export class SetUserSettingsLanguagesAction implements Action {
  readonly type = "SET_USER_SETTINGS_LANGUAGES";

  constructor(public payload: Immutable.List<any>) { }
}

export class SetUserSettingsNotifyPoliciesAction implements Action {
  readonly type = "SET_USER_SETTINGS_NOTIFY_POLICIES";

  constructor(public payload: Immutable.List<any>) { }
}

export class UpdateUserSettingsDataAction implements Action {
  readonly type = "UPDATE_USER_SETTINGS_DATA";
  public payload: any;

  constructor(userId: number, userData: Immutable.Map<string, any>) {
      this.payload = {userId, userData};
  }
}

export class SetUserSettingsFormErrorsAction implements Action {
  readonly type = "SET_USER_SETTINGS_FORM_ERRORS";

  constructor(public payload: Immutable.Map<string, any>) { }
}

