import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";
import {Store} from "@ngrx/store";
import {IState} from "../../../../app.store";
import {ProjectContactAction} from "../../projects.actions";

@Component({
    selector: "tg-project-contact-lightbox",
    template: require("./lb-contact-project.pug"),
})
export class ProjectContactLightbox {
    @Input() project: Immutable.Map<string,any>;
    text: string = "";

    constructor(private store: Store<IState>) {}

    contactProject() {
        if (this.text) {
            this.store.dispatch(new ProjectContactAction(this.project, this.text))
        }
        return false;
    }
}
