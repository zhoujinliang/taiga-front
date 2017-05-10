import {Component, Input, Output, EventEmitter, OnChanges} from "@angular/core";
import * as Immutable from "immutable";
import {ConfigurationService} from "../../../ts/modules/base/conf";
import {TranslateService} from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {EmailValidators} from 'ngx-validators';
import {UniversalValidators} from 'ngx-validators';
import {UsernameValidator} from "../../utils/validators";

@Component({
    selector: "tg-user-settings-form",
    template: require("./user-settings-form.pug")(),
})
export class UserSettingsForm implements OnChanges {
    @Input() user: Immutable.Map<string, any>;
    @Output() deleteAccount: EventEmitter<number>;
    // availableLanguages;
    availableThemes;
    defaultLanguage;
    defaultTheme;
    form: FormGroup;

    constructor(private config: ConfigurationService,
                private translate: TranslateService,
                private fb: FormBuilder) {
        // this.availableLanguages =  this.store.select((state) => state.getIn(["user-settings", "languages"]));
        this.deleteAccount = new EventEmitter();
        this.availableThemes = this.config.get("themes", []);
        this.defaultTheme = this.config.get("defaultTheme", []);
        // this.defaultLanguage = this.translate.preferredLanguage();
        this.form = this.fb.group({
            username: ['', Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(255),
                UsernameValidator,
            ])],
            email: ['', Validators.compose([
                Validators.required,
                EmailValidators.normal,
                UniversalValidators.maxLength(255)
            ])],
            full_name: ['', Validators.compose([
                Validators.required,
                UniversalValidators.maxLength(255)
            ])],
            lang: ['', ],
            theme: ['', ],
            bio: ['', UniversalValidators.maxLength(210)],
        });
    }

    ngOnChanges(changes) {
        if(this.user) {
            this.form.setValue({
                username: this.user.get('username'),
                email: this.user.get('email'),
                full_name: this.user.get('full_name'),
                lang: this.user.get('lang'),
                theme: this.user.get('theme'),
                bio: this.user.get('bio'),
            });
        }
    }

    onSubmit(values) {
        console.log(values);
        console.log(this.form);
    }
}
