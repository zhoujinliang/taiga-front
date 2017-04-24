import * as Immutable from "immutable"

export const projectsInitialState = {
    "user-projects": [],
    "current-project": {}
}

export const projectsReducer = (state, action) => {
    switch(action.type){
        case 'SET_USER_PROJECTS':
            return state.set('user-projects', action.payload);
        case 'SET_CURRENT_PROJECT':
            return state.set('current-project', action.payload);
        default:
            return state;
    }
};
