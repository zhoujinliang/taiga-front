import {Component, Input, OnChanges, ViewChild, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-status-form",
    template: require("./attributes-status-form.pug")(),
})
export class AdminAttributesStatusForm implements OnChanges {
    @Input() status: Immutable.Map<string, any>;
    @Input() visible: boolean;
    @ViewChild('input') nameInput;
    @Output() cancel: EventEmitter<number>;

    constructor() {
        this.cancel = new EventEmitter();
    }

    ngOnChanges(changes) {
        if (changes.visible && !changes.visible.previousValue && changes.visible.currentValue) {
            this.nameInput.nativeElement.focus();
        }
    }
}
