import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class FetchUserProjectsAction implements Action {
  readonly type = "FETCH_USER_PROJECTS";

  constructor(public payload: number) { }
}

export class SetUserProjectsAction implements Action {
  readonly type = "SET_USER_PROJECTS";

  constructor(public payload: Immutable.List<any>) { }
}

export class FetchCurrentProjectAction implements Action {
  readonly type = "FETCH_CURRENT_PROJECT";

  constructor(public payload: string) { }
}

export class SetCurrentProjectAction implements Action {
  readonly type = "SET_CURRENT_PROJECT";

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class FetchProjectTimelineAction implements Action {
  readonly type = "FETCH_PROJECT_TIMELINE";
  public payload: any;

  constructor(projectId: number, page: number) {
      this.payload = {projectId, page}
  }
}

export class SetProjectTimelineAction implements Action {
  readonly type = "SET_PROJECT_TIMELINE";
  public payload: any;

  constructor(timeline: Immutable.List<any>, currentPage: number, hasNext: boolean) {
      this.payload = {timeline, currentPage, hasNext}
  }
}

export class AppendProjectTimelineAction implements Action {
  readonly type = "APPEND_PROJECT_TIMELINE";
  public payload: any;

  constructor(timeline: Immutable.List<any>, currentPage: number, hasNext: boolean) {
      this.payload = {timeline, currentPage, hasNext}
  }
}
