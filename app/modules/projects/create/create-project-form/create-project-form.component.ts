/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: create-project-form.component.ts
 */

import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";
import {Store} from "@ngrx/store";
import {IState} from "../../../../app.store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
    template: require("./create-project-form.pug"),
})
export class CreateProjectFormPage {
    type: string;
    projectForm: FormGroup;

    constructor(private store: Store<IState>,
                private route: ActivatedRoute,
                private fb: FormBuilder) {
        this.projectForm = this.fb.group({
            name: this.fb.group({value: ["", Validators.required]}),
            description: this.fb.group({value: ""}),
            privacy: this.fb.group({value: false}),
        })
    }

    ngOnInit() {
        this.route.params.first().subscribe((params) => {
            this.type = params.type;
        });
    }
}
