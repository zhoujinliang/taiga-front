import {routerReducer} from "@ngrx/router-store";
import * as Immutable from "immutable";
import {authInitialState, authReducer} from "./modules/auth/auth.store";
import {discoverInitialState, discoverReducer} from "./modules/discover/discover.store";
import {homeInitialState, homeReducer} from "./modules/home/home.store";
import {kanbanInitialState, kanbanReducer} from "./modules/kanban/kanban.store";
import {backlogInitialState, backlogReducer} from "./modules/backlog/backlog.store";
import {epicsInitialState, epicsReducer} from "./modules/epics/epics.store";
import {issuesInitialState, issuesReducer} from "./modules/issues/issues.store";
import {projectsInitialState, projectsReducer} from "./modules/projects/projects.store";
import {teamInitialState, teamReducer} from "./modules/team/team.store";
import {commonInitialState, commonReducer} from "./ts/modules/common/common.store";
import {wikiInitialState, wikiReducer} from "./modules/wiki/wiki.store";
import {userSettingsInitialState, userSettingsReducer} from "./modules/user-settings/user-settings.store";
import {adminInitialState, adminReducer} from "./modules/admin/admin.store";

export type IState = Immutable.Map<string, any>;

const globalInitialState = {
    "open-lightbox": "",
    "loading": false,
};

const initialState = Immutable.fromJS({
    global: globalInitialState,
    home: homeInitialState,
    kanban: kanbanInitialState,
    backlog: backlogInitialState,
    epics: epicsInitialState,
    issues: issuesInitialState,
    discover: discoverInitialState,
    common: commonInitialState,
    auth: authInitialState,
    wiki: wikiInitialState,
    admin: adminInitialState,
    projects: projectsInitialState,
    team: teamInitialState,
    "user-settings": userSettingsInitialState,
    router: {
        path: window.location.pathname + window.location.search
    }
});

export const globalReducer = (state, action) => {
    switch (action.type){
        case "START_LOADING":
            return state.set("loading", true);
        case "STOP_LOADING":
            return state.set("loading", false);
        case "CLOSE_LIGHTBOX":
            return state.set("open-lightbox", "");
        case "OPEN_LIGHTBOX":
            return state.set("open-lightbox", action.payload);
        default:
            return state;
    }
};

export const rootReducer = (state= initialState, action) => {
    return state.set("router", routerReducer(state.get("router"), action))
                .set("home", homeReducer(state.get("home"), action))
                .set("global", globalReducer(state.get("global"), action))
                .set("kanban", kanbanReducer(state.get("kanban"), action))
                .set("backlog", backlogReducer(state.get("backlog"), action))
                .set("epics", epicsReducer(state.get("epics"), action))
                .set("issues", issuesReducer(state.get("issues"), action))
                .set("projects", projectsReducer(state.get("projects"), action))
                .set("team", teamReducer(state.get("team"), action))
                .set("discover", discoverReducer(state.get("discover"), action))
                .set("auth", authReducer(state.get("auth"), action))
                .set("wiki", wikiReducer(state.get("wiki"), action))
                .set("admin", adminReducer(state.get("admin"), action))
                .set("user-settings", userSettingsReducer(state.get("user-settings"), action))
                .set("common", commonReducer(state.get("common"), action));
};
