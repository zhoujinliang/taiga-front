import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class DiscardNotificationMessageAction implements Action {
  readonly type = 'DISCARD_NOTIFICATION_MESSAGE';
  payload = null;
}

export class AddNotificationMessageAction implements Action {
  readonly type = 'ADD_NOTIFICATION_MESSAGE';
  payload: any;

  constructor(type: string,
              message?:string,
              title?:string,
              time?:number) {
      this.payload = {type, title, message, time}
  }
}
