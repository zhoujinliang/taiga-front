import * as Immutable from "immutable"

export const kanbanInitialState = {
    userstories: [],
    zoom: 2,
    AppliedFilters: null,
    filtersData: null,
    folds: {},
    archiveVisible: {},
    addTask: null,
}

export const kanbanReducer = (state, action) => {
    switch(action.type){
        case 'SET_KANBAN_USER_STORIES':
            return state.set('userstories', action.payload);
        case 'SET_KANBAN_FILTERS_DATA':
            return state.set('filtersData', action.payload);
        case 'SET_KANBAN_APPLIED_FILTERS':
            return state.set('appliedFilters', action.payload);
        case 'SET_KANBAN_ZOOM':
            return state.set('zoom', Immutable.fromJS(action.payload));
        default:
            return state;
    }
};
