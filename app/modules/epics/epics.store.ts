import * as Immutable from "immutable";

export const epicsInitialState = {
    "epics": [],
    "user-stories": {},
};

export const epicsReducer = (state, action) => {
    switch (action.type) {
        case "SET_EPICS":
            return state.set("epics", action.payload);
        case "SET_EPIC_USER_STORIES":
            return state.setIn(["user-stories", action.payload.id], action.payload.data);
        case "APPEND_EPICS":
            return state.update("epics", (stories) => stories.concat(action.payload));
        case "CLEAN_EPICS_DATA":
            return Immutable.fromJS(epicsInitialState);
        default:
            return state;
    }
};
