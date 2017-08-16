import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class SetFiltersAction implements Action {
  readonly type = "SET_FILTERS";
  public payload: any;

  constructor(public section: string, filter: string, value: any) {
    this.payload = {section, filter, value};
  }
}
