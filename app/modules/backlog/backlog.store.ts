import * as Immutable from "immutable";

export const backlogInitialState = {
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
    "stats": {},
    "sprints": {
        "sprints": [],
        "closed-sprints": [],
        "closed": 0,
        "open": 0,
    },
};

export const backlogReducer = (state, action) => {
    switch (action.type) {
        case "SET_BACKLOG_USER_STORIES":
            return state.set("userstories", action.payload);
        case "APPEND_BACKLOG_USER_STORIES":
            return state.update("userstories", (stories) => stories.concat(action.payload));
        case "SET_BACKLOG_SPRINTS":
            return state.setIn(["sprints", "sprints"], action.payload.get('sprints'))
                        .setIn(["sprints", "open"], action.payload.get('open'))
                        .setIn(["sprints", "closed"], action.payload.get('closed'));
        case "SET_BACKLOG_CLOSED_SPRINTS":
            return state.setIn(["sprints", "closed-sprints"], action.payload);
        case "SET_BACKLOG_FILTERS_DATA":
            return state.set("filtersData", action.payload);
        case "SET_BACKLOG_APPLIED_FILTERS":
            return state.set("appliedFilters", action.payload);
        case "SET_BACKLOG_STATS":
            return state.set("stats", action.payload);
        case "ADD_BACKLOG_FILTER":
            return state.updateIn(["appliedFilters", action.payload.category], (category) => {
                if (category === null) {
                    return Immutable.List(action.payload.filter);
                }
                return category.push(action.payload.filter);
            });
        case "REMOVE_BACKLOG_FILTER":
            return state.updateIn(["appliedFilters", action.payload.category], (category) => {
                if (category === null) {
                    return null;
                } else if (category.includes(action.payload.filter)) {
                    return category.filter((v) => v !== action.payload.filter);
                }
                return category;
            });
        case "SET_BACKLOG_ZOOM":
            return state.set("zoomLevel", action.payload);
        case "SET_BULK_CREATE_LIGHTBOX_DATA":
            return state.set("bulk-create-state", action.payload);
        case "SET_NEW_US_LIGHTBOX_DATA":
            return state.set("current-us", action.payload.us)
                        .set("creation-state", action.payload.statusId);
        case "CLEAN_BACKLOG_DATA":
            return Immutable.fromJS(backlogInitialState);
        default:
            return state;
    }
};
