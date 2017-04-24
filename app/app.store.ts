import * as Immutable from "immutable"
import {routerReducer} from "@ngrx/router-store"
import {homeInitialState, homeReducer} from "./modules/home/home.store"
import {authInitialState, authReducer} from "./modules/auth/auth.store"
import {discoverInitialState, discoverReducer} from "./modules/discover/discover.store"
import {projectsInitialState, projectsReducer} from "./modules/projects/projects.store"
import {commonInitialState, commonReducer} from "./ts/modules/common/common.store"

export type IState = Immutable.Map<string, any>;

const globalInitialState = {
    user: {},
    projects: [],
};

const initialState = Immutable.fromJS({
    global: globalInitialState,
    home: homeInitialState,
    discover: discoverInitialState,
    common: commonInitialState,
    auth: authInitialState,
    projects: projectsInitialState,
})

export const globalReducer = (state, action) => {
    switch(action.type){
        case 'SET_PROJECTS':
            return state.set('projects', action.payload);
        default:
            return state;
    }
};

export const rootReducer = (state=initialState, action) => {
    return state.set('router', routerReducer(state.get('router'), action))
                .set('home', homeReducer(state.get('home'), action))
                .set('projects', projectsReducer(state.get('projects'), action))
                .set('discover', discoverReducer(state.get('discover'), action))
                .set('auth', authReducer(state.get('auth'), action))
                .set('common', commonReducer(state.get('common'), action));
};
