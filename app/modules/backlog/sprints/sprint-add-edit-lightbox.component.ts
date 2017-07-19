import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {Store} from "@ngrx/store";
import {IState} from "../../../app.store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UniversalValidators } from "ngx-validators";
import * as Immutable from "immutable";
import {Observable, Subscription} from "rxjs";

@Component({
    selector: "tg-sprint-add-edit-lightbox",
    template: require("./sprint-add-edit-lightbox.pug")(),
})
export class SprintAddEditLightbox implements OnInit, OnDestroy {
    @Input() field: Immutable.Map<string,any>;
    lastSprint: Observable<Immutable.Map<string, any>>;
    editingSprint: Observable<Immutable.Map<string, any>>;
    subscriptions: Subscription[];
    createEditSprintForm: FormGroup;

    constructor(private store: Store<IState>, private fb: FormBuilder) {
        this.createEditSprintForm = this.fb.group({
            name: ["", Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(500),
            ])],
            startDate: ["", Validators.required],
            endDate: ["", Validators.required],
        });
    }

    ngOnInit() {
        this.subscriptions = [
            this.store.select((state) => state.getIn(["backlog", "sprints", "sprints", 0])).subscribe((lastSprint) => {
                this.lastSprint = lastSprint;
            }),
            this.store.select((state) => state.getIn(["backlog", "editing-sprint"])).subscribe((editingSprint) => {
                this.editingSprint = editingSprint;
            })
        ]
    }

    ngOnDestroy() {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
