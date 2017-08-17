import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class SetFiltersAction implements Action {
  readonly type = "SET_FILTERS";
  public payload: any;

  constructor(public section: string, filter: string, value: any) {
    this.payload = {section, filter, value};
  }
}

export class AddFilterAction implements Action {
  readonly type = "ADD_FILTER";
  public payload: any;

  constructor(public section: string, filter: string, id: any) {
    this.payload = {section, filter, id};
  }
}

export class RemoveFilterAction implements Action {
  readonly type = "REMOVE_FILTER";
  public payload: any;

  constructor(public section: string, filter: string, id: any) {
    this.payload = {section, filter, id};
  }
}
