import * as Immutable from "immutable";

export const wikiInitialState = {
    "page": null,
    "pages": [],
    "history": [],
    "links": [],
};

export const wikiReducer = (state, action) => {
    switch (action.type){
        case "SET_WIKI_PAGE":
            return state.set("page", action.payload);
        case "SET_WIKI_PAGES_LIST":
            return state.set("pages", action.payload);
        case "SET_WIKI_PAGE_HISTORY":
            return state.set("history", action.payload);
        case "SET_WIKI_LINKS":
            return state.set("links", action.payload);
        default:
            return state;
    }
};
