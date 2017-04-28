import {Component, Input} from "@angular/core";
import {Observable} from "rxjs";
import * as Immutable from "immutable";

@Component({
    selector: "tg-wiki-summary",
    template: require("./wiki-summary.pug")(),
})
export class WikiSummary {
    @Input() page: Immutable.List<any>;

    constructor() {
    }

    delete() {
        console.log("delete");
    }
}
