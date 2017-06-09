import * as Immutable from "immutable";

export const epicsInitialState = {
    "epics": [],
};

export const epicsReducer = (state, action) => {
    switch (action.type) {
        case "SET_EPICS":
            return state.set("epics", action.payload);
        case "APPEND_EPICS":
            return state.update("epics", (stories) => stories.concat(action.payload));
        case "CLEAN_EPICS_DATA":
            return Immutable.fromJS(epicsInitialState);
        default:
            return state;
    }
};
