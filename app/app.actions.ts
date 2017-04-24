import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class SetProjectsAction implements Action {
  readonly type = 'SET_PROJECTS';

  constructor(public payload: Immutable.List<any>) { }
}
