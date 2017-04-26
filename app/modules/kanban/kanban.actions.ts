import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class FetchKanbanUserStoriesAction implements Action {
  readonly type = 'FETCH_KANBAN_USER_STORIES';

  constructor(public payload: string) { }
}

export class SetKanbanUserStoriesAction implements Action {
  readonly type = 'SET_KANBAN_USER_STORIES';

  constructor(public payload: Immutable.List<any>) { }
}

export class FetchKanbanFiltersDataAction implements Action {
  readonly type = 'FETCH_KANBAN_FILTERS_DATA';
  payload: any

  constructor(projectId:number, appliedFilters: any) {
      this.payload.projectId = projectId;
      this.payload.appliedFilters = appliedFilters;
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
  payload: any

  constructor(level, map) {
      this.payload.level = level;
      this.payload.map = map;
  }
}

export class SetKanbanZoom implements Action {
  readonly type = 'SET_KANBAN_ZOOM';
  payload: any

  constructor(level, map) {
      this.payload.level = level;
      this.payload.map = map;
  }
}

// export class SearchDiscoverProjects implements Action {
//   readonly type = 'SEARCH_DISCOVER_PROJECTS';
//   payload: any;
//
//   constructor(q: string, filter:string, orderBy: string) {
//     this.payload = {q, filter, orderBy}
//   }
// }
//
// export class FetchMostLikedAction implements Action {
//   readonly type = 'FETCH_MOST_LIKED';
//
//   constructor(public payload: string) { }
// }
//
// export class FetchMostActiveAction implements Action {
//   readonly type = 'FETCH_MOST_ACTIVE';
//
//   constructor(public payload: string) { }
// }
//
// export class FetchProjectsStatsAction implements Action {
//   readonly type = 'FETCH_PROJECTS_STATS';
//   payload = null
// }
//
// export class FetchFeaturedProjectsAction implements Action {
//   readonly type = 'FETCH_FEATURED_PROJECTS';
//   payload = null
// }
//
// export class SetMostActiveAction implements Action {
//   readonly type = 'SET_MOST_ACTIVE';
//
//   constructor(public payload: Immutable.List<any>) { }
// }
//
// export class SetMostLikedAction implements Action {
//   readonly type = 'SET_MOST_LIKED';
//
//   constructor(public payload: Immutable.List<any>) { }
// }
//
// export class SetProjectsStatsAction implements Action {
//   readonly type = 'SET_PROJECTS_STATS';
//
//   constructor(public payload: number) { }
// }
//
// export class SetFeaturedProjectsAction implements Action {
//   readonly type = 'SET_FEATURED_PROJECTS';
//
//   constructor(public payload: Immutable.List<any>) { }
// }
//
// export class AppendDiscoverSearchResults implements Action {
//   readonly type = 'APPEND_DISCOVER_SEARCH_RESULTS';
//
//   constructor(public payload: Immutable.List<any>) { }
// }
//
// export class UpdateDiscoverSearchNextPage implements Action {
//   readonly type = 'UPDATE_DISCOVER_SEARCH_NEXT_PAGE';
//
//   constructor(public payload: boolean) {}
// }
