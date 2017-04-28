import {Component, Input} from "@angular/core";

@Component({
    selector: "tg-main-title",
    template: require("./main-title.pug")(),
})
export class MainTitle {
    @Input() sectionName;
    @Input() projectName;
}
