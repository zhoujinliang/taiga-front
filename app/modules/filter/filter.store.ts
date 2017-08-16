import * as Immutable from "immutable";

export const teamInitialState = {
    "backlog": {
        "q": "",
        "status": [],
        "tags": [],
        "assigned-to": [],
        "created-by": [],
        "epic": [],
    },
    "kanban": {
        "q": "",
        "status": [],
        "tags": [],
        "assigned-to": [],
        "created-by": [],
        "epic": [],
    },
    "issues": {
        "q": "",
        "type": [],
        "severity": [],
        "priority": [],
        "status": [],
        "tags": [],
        "assigned-to": [],
        "created-by": [],
    }
};

export const teamReducer = (state, action) => {
    switch (action.type){
        case "SET_FILTERS":
            return state.setIn(
                [action.payload.section, action.payload.filter],
                Immutable.fromJS(action.payload.value)
            );
        default:
            return state;
    }
};
