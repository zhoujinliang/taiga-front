import {Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "tg-create-epic-form",
    template: require("./create-epic-form.pug")(),
})
export class CreateEpicForm implements OnChanges {
    @Input() project: Immutable.Map<string,any>;
    createEpicForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.createEpicForm = this.fb.group({
            color: ["", Validators.required],
            subject: ["", Validators.required],
            description: ["", Validators.required],
            status: [null, Validators.required],
            tags: [],
            attachments: [],
            teamRequirement: false,
            clientRequirement: false,
            blocked: false,
            blockedNote: ""
        });
    }

    ngOnChanges(changes) {
        if(this.project) {
            this.createEpicForm.controls.status.setValue(this.project.getIn(["epic_statuses", 0, "id"]));
        }
    }
}
