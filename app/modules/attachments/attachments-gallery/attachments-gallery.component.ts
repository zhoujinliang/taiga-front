import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-attachments-gallery",
    template: require("./attachments-gallery.pug")(),
})
export class AttachmentsGallery {
    @Input() attachments: Immutable.List<any>;
    @Input() uploadingAttachments: Immutable.List<any>;
    @Output() delete: EventEmitter<number>;

    constructor() {
        this.delete = new EventEmitter();
    }
}
