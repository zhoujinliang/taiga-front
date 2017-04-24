import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class DiscardNotificationMessageAction implements Action {
  readonly type = 'DISCARD_NOTIFICATION_MESSAGE';

  constructor(public payload: any) { }
}

export class AddNotificationMessageAction implements Action {
  readonly type = 'ADD_NOTIFICATION_MESSAGE';

  constructor(public payload: any) { }
}
