import {Component, Input} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../../app.store";
import { go } from "@ngrx/router-store";
import { CloseLightboxAction } from "../../../app.actions";
import * as Immutable from "immutable";


@Component({
    selector: "tg-search-lightbox",
    template: require("./search-lightbox.pug")(),
})
export class SearchLightbox {
    @Input() project: string;
    text: string = "";

    constructor(private store: Store<IState>) {}

    submit(event) {
        event.preventDefault();
        if (!this.project) {
            return false
        }
        this.store.dispatch(go(["/project", this.project, "search"], {text: this.text}))
        this.store.dispatch(new CloseLightboxAction())
    }
}
