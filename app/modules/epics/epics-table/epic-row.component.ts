import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";
import {Store} from "@ngrx/store";
import {IState} from "../../../app.store";
import {FetchEpicUserStoriesAction} from "../epics.actions";

@Component({
    selector: "tg-epic-row",
    template: require("./epic-row.pug")(),
})
export class EpicRow {
    @Input() project: Immutable.Map<string, any>;
    @Input() epic: Immutable.Map<string, any>;
    @Input() userStories: Immutable.List<any>;
    @Input() columns: any;
    displayUserStories: boolean;

    constructor(private store: Store<IState>) {}

    canEditEpics() {
        // TODO: Implement it
        return true;
    }

    toggleDisplayUserStories() {
        if (!this.userStories) {
            this.store.dispatch(new FetchEpicUserStoriesAction(this.epic.get('id')));
        }
        this.displayUserStories = !this.displayUserStories;
    }

    percentage() {
        let opened = this.epic.getIn(['user_stories_counts', 'opened']);
        let closed = this.epic.getIn(['user_stories_counts', 'closed']);

        if (opened && closed) {
            return (100 * closed) / (opened + closed);
        }
        return 0;
    }
}
