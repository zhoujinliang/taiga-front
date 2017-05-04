import {Component, Input, Output, OnChanges, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-attachments-list",
    template: require("./attachments-list.pug")(),
})
export class AttachmentsList implements OnChanges {
    @Input() attachments: Immutable.List<any>;
    @Input() uploadingAttachments: Immutable.List<any>;
    @Output() delete: EventEmitter<number>;
    @Output() update: EventEmitter<any>;
    @Output() preview: EventEmitter<any>;
    deprecateds: Immutable.List<any>;
    deprecatedsVisible: boolean = false;

    constructor() {
        this.delete = new EventEmitter();
        this.update = new EventEmitter();
        this.preview = new EventEmitter();
    }

    ngOnChanges() {
        this.deprecateds = this.attachments.filter((att) => att.get('is_deprecated')).toList();
    }

    toggleDeprecatedsVisible() {
        this.deprecatedsVisible = !this.deprecatedsVisible;
    }
}
