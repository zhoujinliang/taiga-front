import * as Immutable from "immutable"

export const kanbanInitialState = {
    userstories: [],
    zoom: 2,
    filters: {
        query: "",
        status: [],
        tags: [],
        assigned_to: [],
        created_by: [],
        epic: [],
    },
    folds: {},
    archiveVisible: {},
    addTask: null,
}

export const kanbanReducer = (state, action) => {
    switch(action.type){
        case 'SET_KANBAN_USER_STORIES':
            return state.set('userstories', action.payload);
        case 'SET_KANBAN_ZOOM':
            return state.set('zoom', Immutable.fromJS(action.payload));
        default:
            return state;
    }
};
