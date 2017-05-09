import {Component, Output, EventEmitter} from "@angular/core";

@Component({
    selector: "tg-change-password-form",
    template: require("./change-password-form.pug")(),
})
export class ChangePasswordForm {
    @Output() changePassword: EventEmitter<any>;

    constructor() {
        this.changePassword = new EventEmitter();
    }
}
