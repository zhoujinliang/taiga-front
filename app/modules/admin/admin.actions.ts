import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class TeamLeaveProjectAction implements Action {
  readonly type = "TEAM_LEAVE_PROJECT";

  constructor(public payload: number) { }
}

export class FetchTeamStatsAction implements Action {
  readonly type = "FETCH_TEAM_STATS";

  constructor(public payload: number) { }
}

export class SetTeamStatsAction implements Action {
  readonly type = "SET_TEAM_STATS";

  constructor(public payload: Immutable.Map<string, any>) { }
}
