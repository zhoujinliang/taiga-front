import * as Immutable from "immutable";

export const filterInitialState = {
    "backlog": {
        "q": "",
        "status": [],
        "tags": [],
        "assigned_to": [],
        "owner": [],
        "epic": [],
    },
    "kanban": {
        "q": "",
        "status": [],
        "tags": [],
        "assigned_to": [],
        "owner": [],
        "epic": [],
    },
    "issues": {
        "q": "",
        "type": [],
        "severity": [],
        "priority": [],
        "status": [],
        "tags": [],
        "assigned_to": [],
        "owner": [],
    }
};

export const filterReducer = (state, action) => {
    switch (action.type){
        case "SET_FILTERS":
            return state.setIn(
                [action.payload.section, action.payload.filter],
                Immutable.fromJS(action.payload.value)
            );
        case "ADD_FILTER":
            return state.updateIn(
                [action.payload.section, action.payload.filter],
                (values) => values.push(action.payload.id)
            );
        case "REMOVE_FILTER":
            return state.updateIn(
                [action.payload.section, action.payload.filter],
                (values) => values.filter((id) => id.toString() !== action.payload.id.toString())
            );
        default:
            return state;
    }
};
