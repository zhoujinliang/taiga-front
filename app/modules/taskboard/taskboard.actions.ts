import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class FetchTaskboardUserStoriesAction implements Action {
  readonly type = "FETCH_TASKBOARD_USER_STORIES";
  payload: any;

  constructor(projectId: number, appliedFilters: any) {
      this.payload = {
          projectId,
          appliedFilters,
      };
  }
}

export class MoveTaskboardUsAction implements Action {
  readonly type = "MOVE_TASKBOARD_US";
  payload: any;

  constructor(usId: number, newStatusId: number, newIndex: number) {
      this.payload = {usId, newStatusId, newIndex};
  }
}

export class SetTaskboardUserStoriesAction implements Action {
  readonly type = "SET_TASKBOARD_USER_STORIES";

  constructor(public payload: Immutable.List<any>) { }
}

export class AppendTaskboardUserStoriesAction implements Action {
  readonly type = "APPEND_TASKBOARD_USER_STORIES";

  constructor(public payload: Immutable.List<any>) { }
}

export class FetchTaskboardFiltersDataAction implements Action {
  readonly type = "FETCH_TASKBOARD_FILTERS_DATA";
  payload: any;

  constructor(projectId: number, appliedFilters: any) {
      this.payload = {
          projectId,
          appliedFilters,
      };
  }
}

export class SetTaskboardFiltersDataAction implements Action {
  readonly type = "SET_TASKBOARD_FILTERS_DATA";

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class FetchTaskboardAppliedFiltersAction implements Action {
  readonly type = "FETCH_TASKBOARD_APPLIED_FILTERS";

  constructor(public payload: number) {}
}

export class SetTaskboardAppliedFiltersAction implements Action {
  readonly type = "SET_TASKBOARD_APPLIED_FILTERS";

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class ChangeTaskboardZoom implements Action {
  readonly type = "CHANGE_TASKBOARD_ZOOM";

  constructor(public payload: number) {}
}

export class SetTaskboardZoom implements Action {
  readonly type = "SET_TASKBOARD_ZOOM";

  constructor(public payload: number) {}
}

export class AddTaskboardFilter implements Action {
  readonly type = "ADD_TASKBOARD_FILTER";
  payload: any;

  constructor(category: string, filter: string) {
      this.payload = {category, filter};
  }
}

export class RemoveTaskboardFilter implements Action {
  readonly type = "REMOVE_TASKBOARD_FILTER";
  payload: any;

  constructor(category: string, filter: string) {
      this.payload = {category, filter};
  }
}

export class CleanTaskboardDataAction implements Action {
  readonly type = "CLEAN_TASKBOARD_DATA";
  payload = null;
}

export class SetBulkCreateLightboxDataAction implements Action {
  readonly type = "SET_BULK_CREATE_LIGHTBOX_DATA";

  constructor(public payload: number) {}
}

export class SetNewUsLightboxDataAction implements Action {
  readonly type = "SET_NEW_US_LIGHTBOX_DATA";
  payload: any;

  constructor(statusId: number, us: Immutable.Map<string, any>) {
      this.payload = {statusId, us};
  }
}

export class USBulkCreateAction implements Action {
  readonly type = "US_BULK_CREATE";
  payload: any;

  constructor(projectId: number, statusId: number, stories: string) {
      this.payload = {projectId, statusId, stories};
  }
}
