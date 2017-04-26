import * as Immutable from "immutable"

export const kanbanInitialState = {
    userstories: [],
    zoom: 2,
    AppliedFilters: {},
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
        case 'ADD_KANBAN_FILTER':
            return state.updateIn(['appliedFilters', action.payload.category], (category) => {
                if (category === null) {
                    return Immutable.List(action.payload.filter)
                }
                return category.push(action.payload.filter)
            });
        case 'REMOVE_KANBAN_FILTER':
            return state.updateIn(['appliedFilters', action.payload.category], (category) => {
                if (category === null) {
                    return null;
                } else if (category.includes(action.payload.filter)) {
                    return category.filter((v) => v != action.payload.filter);
                }
                return category
            });
        case 'SET_KANBAN_ZOOM':
            return state.set('zoom', Immutable.fromJS(action.payload));
        default:
            return state;
    }
};
