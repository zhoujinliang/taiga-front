import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class FetchCurrentProjectAction implements Action {
  readonly type = 'FETCH_CURRENT_PROJECT';

  constructor(public payload: string) { }
}

export class SetCurrentProjectAction implements Action {
  readonly type = 'SET_CURRENT_PROJECT';

  constructor(public payload: Immutable.Map<string,any>) { }
}
