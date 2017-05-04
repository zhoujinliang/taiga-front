import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../app.store";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import * as Immutable from "immutable";
import * as actions from "./wiki.actions";

@Component({
    template: require("./wiki.pug")(),
})
export class WikiPage {
    project: Observable<Immutable.Map<string, any>>;
    linksVisible: boolean = true;
    links: Observable<Immutable.List<any>>;
    page: Observable<Immutable.Map<string, any>>;
    pageAttachments: Observable<Immutable.List<any>>;
    historyEntries: Observable<Immutable.List<any>>;

    constructor(private store: Store<IState>, private route: ActivatedRoute) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.links = this.store.select((state) => state.getIn(["wiki", "links"]));
        this.page = this.store.select((state) => state.getIn(["wiki", "page"]));
        this.pageAttachments = this.store.select((state) => state.getIn(["wiki", "page-attachments"]));
        this.historyEntries = this.store.select((state) => state.getIn(["wiki", "history"]))
                                        .map((historyEntries) => historyEntries.reverse());
    }

    ngOnInit() {
        this.project.subscribe((project) => {
            if (project != null) {
                this.store.dispatch(new actions.FetchWikiLinksAction(project.get('id')))
                this.route.params.subscribe((params) => {
                    if (params.page) {
                        this.store.dispatch(new actions.FetchWikiPageAction(project.get('id'), params.page))
                    }
                })
            }
        });

        this.page.subscribe((page) => {
            if (page != null) {
                this.store.dispatch(new actions.FetchWikiPageAttachmentsAction(page.get('project'), page.get('id')))
                this.store.dispatch(new actions.FetchWikiPageHistoryAction(page.get('id')))
            }
        });
    }
}
