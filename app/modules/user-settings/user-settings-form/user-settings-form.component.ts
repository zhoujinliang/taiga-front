import {Component, Input, Output, EventEmitter} from "@angular/core";
import * as Immutable from "immutable";
import {ConfigurationService} from "../../../ts/modules/base/conf";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: "tg-user-settings-form",
    template: require("./user-settings-form.pug")(),
})
export class UserSettingsForm {
    @Input() user: Immutable.Map<string, any>;
    @Output() deleteAccount: EventEmitter<number>;
    // availableLanguages;
    availableThemes;
    defaultLanguage;
    defaultTheme;

    constructor(private config: ConfigurationService,
                private translate: TranslateService) {
        // this.availableLanguages =  this.store.select((state) => state.getIn(["user-settings", "languages"]));
        this.deleteAccount = new EventEmitter();
        this.availableThemes = this.config.get("themes", []);
        this.defaultTheme = this.config.get("defaultTheme", []);
        // this.defaultLanguage = this.translate.preferredLanguage();
    }
}
