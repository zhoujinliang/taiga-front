import * as Immutable from "immutable";

export const taskboardInitialState = {
    "AppliedFilters": {},
    "addTask": null,
    "archiveVisible": {},
    "bulk-create-state": null,
    "creation-state": null,
    "current-userstory": null,
    "filtersData": null,
    "folds": {},
    "userstories": null,
    "zoomLevel": 4,
};

export const taskboardReducer = (state, action) => {
    switch (action.type) {
        case "SET_TASKBOARD_USER_STORIES":
            return state.set("userstories", action.payload);
        case "APPEND_TASKBOARD_USER_STORIES":
            return state.update("userstories", (stories) => stories.concat(action.payload));
        case "SET_TASKBOARD_FILTERS_DATA":
            return state.set("filtersData", action.payload);
        case "SET_TASKBOARD_APPLIED_FILTERS":
            return state.set("appliedFilters", action.payload);
        case "ADD_TASKBOARD_FILTER":
            return state.updateIn(["appliedFilters", action.payload.category], (category) => {
                if (category === null) {
                    return Immutable.List(action.payload.filter);
                }
                return category.push(action.payload.filter);
            });
        case "REMOVE_TASKBOARD_FILTER":
            return state.updateIn(["appliedFilters", action.payload.category], (category) => {
                if (category === null) {
                    return null;
                } else if (category.includes(action.payload.filter)) {
                    return category.filter((v) => v !== action.payload.filter);
                }
                return category;
            });
        case "SET_TASKBOARD_ZOOM":
            return state.set("zoomLevel", action.payload);
        case "SET_BULK_CREATE_LIGHTBOX_DATA":
            return state.set("bulk-create-state", action.payload);
        case "SET_NEW_US_LIGHTBOX_DATA":
            return state.set("current-us", action.payload.us)
                        .set("creation-state", action.payload.statusId);
        case "CLEAN_TASKBOARD_DATA":
            return Immutable.fromJS(taskboardInitialState);
        default:
            return state;
    }
};
