import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class FetchEpicsAction implements Action {
  readonly type = "FETCH_EPICS";

  constructor(public payload: number) {}
}

export class SetEpicsAction implements Action {
  readonly type = "SET_EPICS";

  constructor(public payload: Immutable.List<any>) { }
}

export class AppendEpicsAction implements Action {
  readonly type = "APPEND_EPICS";

  constructor(public payload: Immutable.List<any>) { }
}

export class CleanEpicsDataAction implements Action {
  readonly type = "CLEAN_EPICS_DATA";
  payload = null;
}
