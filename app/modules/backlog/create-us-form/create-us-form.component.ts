import {Component, Input, OnChanges, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UniversalValidators } from "ngx-validators";
import {ColorSelectorService} from "../../components/color-selector/color-selector.service";

@Component({
    selector: "tg-create-us-form",
    template: require("./create-us-form.pug")(),
})
export class CreateUsForm implements OnChanges {
    @Input() project: Immutable.Map<string,any>;
    @Output() createUs: EventEmitter<any>;
    createUsForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.createUs = new EventEmitter();
        this.createUsForm = this.fb.group({
            subject: ["", Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(140),
            ])],
            description: [""],
            tags: [[]],
            attachments: [[]],
            teamRequirement: [false],
            clientRequirement: [false],
            blocked: [false],
            blockedNote: [""],
            status: [null, Validators.required],
        });
    }

    ngOnChanges(changes) {
        if(this.project) {
            this.createUsForm.controls.status.setValue(this.project.getIn(["us_statuses", 0, "id"]));
        }
    }

    onSubmit() {
        if (this.createUsForm.valid) {
            this.createUs.emit(this.createUsForm.value);
        } else {
            this.createUsForm.controls.subject.markAsDirty();
        }
        return false;
    }
}
