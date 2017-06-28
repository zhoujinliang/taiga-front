import { Action } from "@ngrx/store";
import * as Immutable from "immutable";
import { LoginData, RegisterData } from "./auth.model";

export class SetUserAction implements Action {
  readonly type = "SET_USER";

  constructor(public payload: Immutable.Map<any, any>) { }
}

export class StoreUserAction implements Action {
  readonly type = "STORE_USER";

  constructor(public payload: Immutable.Map<any, any>) { }
}

export class RestoreUserAction implements Action {
  readonly type = "RESTORE_USER";
  payload = null;
}

export class LogoutAction implements Action {
  readonly type = "LOGOUT";
  payload = null;
}

export class LoginAction implements Action {
  readonly type = "LOGIN";
  payload: any;

  constructor(data: LoginData, next: string) {
      this.payload = {data, next};
  }
}

export class RegisterAction implements Action {
  readonly type = "REGISTER";
  public payload: any;

  constructor(data: RegisterData, next: string) {
      this.payload = {data, next};
  }
}

export class PasswordRecoverAction implements Action {
  readonly type = "PASSWORD_RECOVER";

  constructor(public payload: string) { }
}

export class SetLoginErrorsAction implements Action {
  readonly type = "SET_LOGIN_ERRORS";

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class SetRegisterErrorsAction implements Action {
  readonly type = "SET_REGISTER_ERRORS";

  constructor(public payload: Immutable.Map<string, any>) { }
}

export class SetPasswordRecoverErrorsAction implements Action {
  readonly type = "SET_PASSWORD_RECOVER_ERRORS";

  constructor(public payload: Immutable.Map<string, any>) { }
}
