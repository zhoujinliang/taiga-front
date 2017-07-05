import {Component, Input, OnChanges, OnInit, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UniversalValidators } from "ngx-validators";
import {ColorSelectorService} from "../../components/color-selector/color-selector.service";

@Component({
    selector: "tg-create-epic-form",
    template: require("./create-epic-form.pug")(),
})
export class CreateEpicForm implements OnChanges, OnInit {
    @Input() statuses: Immutable.Map<string,any>;
    @Output() createEpic: EventEmitter<any>;
    createEpicForm: FormGroup;

    constructor(private fb: FormBuilder, private colorSelector: ColorSelectorService) {
        this.createEpic = new EventEmitter();
    }

    ngOnInit() {
        this.createEpicForm = this.fb.group({
            color: [this.colorSelector.getRandom(), Validators.required],
            subject: ["", Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(140),
            ])],
            description: ["", Validators.required],
            status: [null, Validators.required],
            tags: [[]],
            attachments: [[]],
            teamRequirement: [false],
            clientRequirement: [false],
            blocked: [false],
            blockedNote: [""]
        });
    }

    ngOnChanges(changes) {
        if(this.statuses) {
            this.createEpicForm.controls.status.setValue(this.statuses.getIn([0, "id"]));
        }
    }

    onSubmit() {
        if (this.createEpicForm.valid) {
            this.createEpic.emit(this.createEpicForm.value);
        } else {
            this.createEpicForm.controls.subject.markAsDirty();
        }
        return false;
    }
}
