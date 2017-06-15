import * as Immutable from "immutable";

export const profileInitialState = {
    "user": null,
    "stats": null,
    "contacts": null,
    "items": null,
    "projects": null,
};

export const profileReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER_PROFILE":
            return state.set("user", action.payload);
        case "SET_USER_STATS":
            return state.set("stats", action.payload);
        case "SET_PROFILE_CONTACTS":
            return state.set("contacts", action.payload);
        case "SET_PROFILE_ITEMS":
            return state.set("items", action.payload);
        case "SET_PROFILE_PROJECTS":
            return state.set("projects", action.payload);
        case "CLEAN_PROFILE_DATA":
            return Immutable.fromJS(profileInitialState);
        default:
            return state;
    }
};
