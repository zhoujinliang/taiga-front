import * as Immutable from "immutable";

export const detailInitialState = {
    "epic": null,
    "userstory": null,
    "task": null,
    "issue": null,
};

export const detailReducer = (state, action) => {
    switch (action.type) {
        case "SET_DETAIL_USER_STORY":
            return state.set("userstory", action.payload);
        case "SET_DETAIL_USER_STORY_CUSTOM_ATTRIBUTES":
            return state.set("userstory-custom-attributes", action.payload);
        case "SET_DETAIL_EPIC":
            return state.set("epic", action.payload);
        case "SET_DETAIL_TASK":
            return state.set("task", action.payload);
        case "SET_DETAIL_ISSUE":
            return state.set("issue", action.payload);
        case "CLEAN_DETAIL_DATA":
            return Immutable.fromJS(detailInitialState);
        default:
            return state;
    }
};
