import {Component, Input, OnChanges, ViewChild, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-admin-attributes-issues-form",
    template: require("./attributes-issues-form.pug")(),
})
export class AdminAttributesIssuesForm implements OnChanges {
    @Input() value: Immutable.Map<string, any>;
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
