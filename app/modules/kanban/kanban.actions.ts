import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class FetchKanbanUserStoriesAction implements Action {
  readonly type = 'FETCH_KANBAN_USER_STORIES';
  payload: any

  constructor(projectId:number, appliedFilters: any) {
      this.payload = {
          projectId: projectId,
          appliedFilters: appliedFilters
      }
  }
}

export class SetKanbanUserStoriesAction implements Action {
  readonly type = 'SET_KANBAN_USER_STORIES';

  constructor(public payload: Immutable.List<any>) { }
}

export class FetchKanbanFiltersDataAction implements Action {
  readonly type = 'FETCH_KANBAN_FILTERS_DATA';
  payload: any

  constructor(projectId:number, appliedFilters: any) {
      this.payload = {
          projectId: projectId,
          appliedFilters: appliedFilters
      }
  }
}

export class SetKanbanFiltersDataAction implements Action {
  readonly type = 'SET_KANBAN_FILTERS_DATA';

  constructor(public payload: Immutable.Map<string, any>) { }
}


export class FetchKanbanAppliedFiltersAction implements Action {
  readonly type = 'FETCH_KANBAN_APPLIED_FILTERS';

  constructor(public payload: number) {}
}

export class SetKanbanAppliedFiltersAction implements Action {
  readonly type = 'SET_KANBAN_APPLIED_FILTERS';

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class ChangeKanbanZoom implements Action {
  readonly type = 'CHANGE_KANBAN_ZOOM';

  constructor(public payload:number) {}
}

export class SetKanbanZoom implements Action {
  readonly type = 'SET_KANBAN_ZOOM';

  constructor(public payload:number) {}
}

export class AddKanbanFilter implements Action {
  readonly type = 'ADD_KANBAN_FILTER';
  payload: any

  constructor(category:string, filter:string) {
      this.payload = {category, filter};
  }
}

export class RemoveKanbanFilter implements Action {
  readonly type = 'REMOVE_KANBAN_FILTER';
  payload: any

  constructor(category:string, filter:string) {
      this.payload = {category, filter};
  }
}
