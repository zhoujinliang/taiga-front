import * as Immutable from "immutable";

export const projectsInitialState = {
    "user-projects": [],
    "current-project": null,
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
        default:
            return state;
    }
};
