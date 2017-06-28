import {Component, EventEmitter, Output} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ConfigurationService } from "../../../ts/modules/base/conf";
import {LoginData} from "../auth.model";

@Component({
    selector: "tg-login-form",
    template: require("./login-form.pug")(),
})
export class LoginForm {
    @Output() login: EventEmitter<LoginData>;
    loginForm: FormGroup;

    constructor(private config: ConfigurationService,
                private fb: FormBuilder) {
        this.login = new EventEmitter();
        this.loginForm = this.fb.group({
            username: ["", Validators.required],
            password: ["", Validators.required],
            type: "normal",
        });
    }

    onSubmit(): boolean {
        if (this.loginForm.valid) {
            this.login.emit(this.loginForm.value);
        } else {
            this.loginForm.controls.username.markAsDirty();
            this.loginForm.controls.password.markAsDirty();
        }
        return false;
    }
}
