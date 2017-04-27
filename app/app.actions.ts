import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class OpenLightboxAction implements Action {
  readonly type = 'OPEN_LIGHTBOX';

  constructor(public payload: string) { }
}

export class CloseLightboxAction implements Action {
  readonly type = 'CLOSE_LIGHTBOX';
  payload = null;

  constructor() { }
}
