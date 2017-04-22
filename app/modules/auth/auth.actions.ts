import * as Immutable from "immutable";
import { Action } from '@ngrx/store';

export class LoginAction implements Action {
  readonly type = 'LOGIN';

  constructor(public payload: number) { }
}

export class RegisterAction implements Action {
  readonly type = 'REGISTER';

  constructor(public payload: number) { }
}

export class SetLoginErrorsAction implements Action {
  readonly type = 'SET_LOGIN_ERRORS';

  constructor(public payload: Immutable.Map<string,any>) { }
}

export class SetRegisterErrorsAction implements Action {
  readonly type = 'SET_REGISTER_ERRORS';

  constructor(public payload: Immutable.Map<string,any>) { }
}
