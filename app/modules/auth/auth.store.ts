import * as Immutable from "immutable"

export const authInitialState = {
    "login-errors": {},
    "register-errors": {},
}

export const authReducer = (state, action) => {
    switch(action.type){
        case 'SET_LOGIN_ERRORS':
            return state.set('login-errors', action.payload);
        case 'SET_REGISTER_ERRORS':
            return state.set('register-errors', action.payload);
        default:
            return state;
    }
};
