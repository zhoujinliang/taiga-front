import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import * as Immutable from "immutable";
import {FetchWikiLinksAction} from "./wiki.actions";

@Component({
    template: require("./wiki.pug")(),
})
export class WikiPage {
    project: Observable<Immutable.Map<string, any>>;
    linksVisible: boolean = true;
    links: Observable<Immutable.List<any>>;

    constructor(private store: Store<IState>, private route: ActivatedRoute) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.links = this.store.select((state) => state.getIn(["wiki", "links"]));
    }

    ngOnInit() {
        this.project.subscribe((project) => {
            if (project != null) {
                this.store.dispatch(new FetchWikiLinksAction(project.get('id')))
            }
        });
    }
}
