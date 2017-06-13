import * as Immutable from "immutable";

export const projectsInitialState = {
    "user-projects": [],
    "current-project": null,
    "timeline": {
        "items": null,
        "has-next": true,
        "current-page": 0,
    }
};

export const projectsReducer = (state, action) => {
    switch (action.type){
        case "SET_USER_PROJECTS":
            return state.set("user-projects", action.payload);
        case "SET_CURRENT_PROJECT":
            let membersById = action.payload.get('members')
                                    .reduce((members, member) => members.set(member.get('id'), member),
                                            Immutable.Map());
            return state.set("current-project", action.payload)
                        .setIn(["current-project", "membersById"], membersById);
        case "SET_PROJECT_TIMELINE":
            return state.setIn(["timeline", "items"], action.payload.timeline)
                        .setIn(["timeline", "has-next"], action.payload.hasNext)
                        .setIn(["timeline", "current-page"], action.payload.currentPage);
        case "APPEND_PROJECT_TIMELINE":
            return state.updateIn(["timeline", "items"], (current) => current.concat(action.payload.timeline))
                        .setIn(["timeline", "has-next"], action.payload.hasNext)
                        .setIn(["timeline", "current-page"], action.payload.currentPage);
        default:
            return state;
    }
};
