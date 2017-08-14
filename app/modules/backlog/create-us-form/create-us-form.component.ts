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
    @Input() us: Immutable.Map<string,any>;
    @Output() createUs: EventEmitter<any>;
    createUsForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.createUs = new EventEmitter();
        this.createUsForm = this.fb.group({
            subject: ["", Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(140),
            ])],
            points: [{}],
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
        if(this.us) {
            this.createUsForm.controls.subject.setValue(this.us.get("subject"));
            this.createUsForm.controls.points.setValue(this.us.get("subject"));
            this.createUsForm.controls.description.setValue(this.us.get("description"));
            this.createUsForm.controls.tags.setValue(this.us.get("tags"));
            this.createUsForm.controls.attachments.setValue(this.us.get("attachments"));
            this.createUsForm.controls.teamRequirement.setValue(this.us.get("team_requirement"));
            this.createUsForm.controls.clientRequirement.setValue(this.us.get("client_requirement"));
            this.createUsForm.controls.blocked.setValue(this.us.get("blocked"));
            this.createUsForm.controls.blockedNote.setValue(this.us.get("blockedNote"));
            this.createUsForm.controls.status.setValue(this.us.get("status"));
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
