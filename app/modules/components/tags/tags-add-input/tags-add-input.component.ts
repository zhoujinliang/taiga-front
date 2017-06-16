import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-tags-add-input",
    template: require("./tags-add-input.pug")(),
})
export class TagsAddInput {
    @Input() field: Immutable.Map<string,any>;
    @Input() disableColorSelection: boolean;
    newTag: any = {name: "", color: ""};
    colorArray: string[];
}
