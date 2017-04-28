import {Component, Input} from "@angular/core";
import {Observable} from "rxjs";
import * as Immutable from "immutable";

@Component({
    selector: "tg-wiki-nav",
    template: require("./wiki-nav.pug")(),
})
export class WikiNav {
    @Input() project: Immutable.Map<string, any>;
    @Input() links: Immutable.List<any>;

    constructor() {
    }
}
