import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class DiscardMessageAction implements Action {
  readonly type = 'DiscardMessage';

  constructor(public payload: any) { }
}
