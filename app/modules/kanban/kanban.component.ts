import {Component} from "@angular/core";
import { IState } from "../../app.store";
import { Store } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import { FetchKanbanUserStoriesAction } from "./kanban.actions";
import "rxjs/add/operator/map";

@Component({
    template: require('./kanban.jade')()
})
export class KanbanPage {
    section = "kanban";
    project: any;
    userstoriesByState: any;
    zoom:any;
    selectedFilters = []

    constructor(private store: Store<IState>, private route: ActivatedRoute) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]))
        this.userstoriesByState = this.store.select((state) => state.getIn(["kanban", "userstories"])).map((userstories) => {
            return userstories.groupBy((us) => us.get('status').toString())
        })
        this.zoom = this.store.select((state) => state.getIn(["kanban", "zoom"]))
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.store.dispatch(new FetchCurrentProjectAction(params.slug));
        });
        this.project.subscribe((project) => {
            if (project) {
                this.store.dispatch(new FetchKanbanUserStoriesAction(project.get('id')));
            }
        });
    }

}
