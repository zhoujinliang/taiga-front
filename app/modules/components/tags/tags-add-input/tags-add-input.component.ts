import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-tags-add-input",
    template: require("./tags-add-input.pug")(),
})
export class TagsAddInput {
    @Input() field: Immutable.Map<string,any>;
    @Input() disableColorSelection: boolean;
    @Output() add: EventEmitter<any>;
    newTag: any = {name: "", color: ""};
    colorArray: string[];

    constructor() {
        this.add = new EventEmitter();
    }

    setName(event) {
        this.newTag.name = event.target.value;
        console.log(event.keyCode);
        if (event.keyCode === 13) {
            event.stopPropagation();
            this.add.emit(this.newTag);
            return false;
        }
    }
}
