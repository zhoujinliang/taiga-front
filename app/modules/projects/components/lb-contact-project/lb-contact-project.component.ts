import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-project-contact-lightbox",
    template: require("./lb-contact-project.pug")(),
})
export class ProjectContactLightbox {
    @Input() project: Immutable.Map<string,any>;
}
