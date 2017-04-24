import {Component, OnInit, Output, EventEmitter} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import { FormGroup, FormBuilder, Validators } from "@angular/forms"

import {LoginData} from "../auth.model"
import { ConfigurationService } from "../../../ts/modules/base/conf";

@Component({
    selector: "tg-forgot-password-form",
    template: require("./forgot-password-form.jade")()
})
export class ForgotPasswordForm implements OnInit {
    @Output() submit: EventEmitter<LoginData>;
    forgotPasswordForm: FormGroup;
    private queryParams: any;

    constructor(private config: ConfigurationService,
                private fb: FormBuilder,
                private activeRoute: ActivatedRoute) {
        this.submit = new EventEmitter();
        this.forgotPasswordForm = this.fb.group({
            "username": ['', Validators.required],
        })
        console.log(this.forgotPasswordForm);
    }

    ngOnInit() {
        this.activeRoute.queryParams.subscribe((params) => {
            this.queryParams = params
        })
    }

    onSubmit():boolean {
        this.submit.emit(this.forgotPasswordForm.value.username);
        return false;
    }
}
