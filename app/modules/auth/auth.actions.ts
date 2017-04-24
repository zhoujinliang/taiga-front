import * as Immutable from "immutable";
import { LoginData, RegisterData } from "./auth.model"
import { Action } from '@ngrx/store';

export class LoginAction implements Action {
  readonly type = 'LOGIN';

  constructor(public payload: LoginData) { }
}

export class RegisterAction implements Action {
  readonly type = 'REGISTER';

  constructor(public payload: RegisterData) { }
}

export class PasswordRecoverAction implements Action {
  readonly type = 'PASSWORD_RECOVER';

  constructor(public payload: string) { }
}

export class SetLoginErrorsAction implements Action {
  readonly type = 'SET_LOGIN_ERRORS';

  constructor(public payload: Immutable.Map<string,any>) { }
}

export class SetRegisterErrorsAction implements Action {
  readonly type = 'SET_REGISTER_ERRORS';

  constructor(public payload: Immutable.Map<string,any>) { }
}

export class SetPasswordRecoverErrorsAction implements Action {
  readonly type = 'SET_PASSWORD_RECOVER_ERRORS';

  constructor(public payload: Immutable.Map<string,any>) { }
}
