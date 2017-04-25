import {Directive, Input, ViewContainerRef, TemplateRef} from "@angular/core";
import { Store } from "@ngrx/store";
import { IState } from "../../../app.store";


@Directive({
    selector: "[tg-visible]",
})
export class Visible {
    @Input("tg-visible") item;

    zooms = [
        ["ref"],
        ["subject"],
        ["owner", "tags", "extra_info", "unfold"],
        ["attachments"],
        ["related_tasks", "empty_extra_info"]
    ];

    constructor(private store: Store<IState>,
                private viewContainer: ViewContainerRef,
                // private templateRef: TemplateRef<any>
               ) {
        this.store.select((state) => state.getIn(["kanban", "zoomLevel"])).subscribe((zoomLevel) => {
            if (zoomLevel && this.zooms[zoomLevel].indexOf(this.item) !== -1) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            } else {
                this.viewContainer.clear();
            }
        })
    }
}
