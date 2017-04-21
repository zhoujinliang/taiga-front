import * as Immutable from "immutable"

export const currentProjectInitialState = {}

export const currentProjectReducer = (state, action) => {
    switch(action.type){
        case 'SET_CURRENT_PROJECT':
            return action.payload;
        default:
            return state;
    }
};
