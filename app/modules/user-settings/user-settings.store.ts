import * as Immutable from "immutable";

export const userSettingsInitialState = {
    "languages": [],
    "notify-policies": [],
    "form-errors": {},
};

export const userSettingsReducer = (state, action) => {
    switch (action.type){
        case "SET_USER_SETTINGS_LANGUAGES":
            return state.set("languages", action.payload);
        case "SET_USER_SETTINGS_NOTIFY_POLICIES":
            return state.set("notify-policies", action.payload);
        case "SET_USER_SETTINGS_FORM_ERRORS":
            return state.set("form-errors", action.payload);
        default:
            return state;
    }
};
