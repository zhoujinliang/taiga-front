import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class FetchAssignedToAction implements Action {
  readonly type = 'FETCH_ASSIGNED_TO';
  payload: any;

  constructor(userId, projects) {
      this.payload = {userId, projects};
  }
}

export class FetchWatchingAction implements Action {
  readonly type = 'FETCH_WATCHING';
  payload: any;

  constructor(userId, projects) {
      this.payload = {userId, projects};
  }
}

export class SetAssignedToAction implements Action {
  readonly type = 'SET_ASSIGNED_TO';

  constructor(public payload: Immutable.Map<string,any>) { }
}

export class SetWatchingAction implements Action {
  readonly type = 'SET_WATCHING';

  constructor(public payload: Immutable.Map<string,any>) { }
}
