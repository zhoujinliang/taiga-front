import {CommonModule} from "@angular/common";
import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgPipesModule} from "../pipes/pipes.module";
import {TgComponentsModule} from "../components/components.module";
import {TgAttachmentsModule} from "../attachments/attachments.module";
import {TgServicesModule} from "../services/services.module";
import {UserSettingsPage} from "./user-settings.component";
import {UserSettingsNavigation} from "./navigation/navigation.component";
import {UserSettingsForm} from "./user-settings-form/user-settings-form.component";
import {DeleteAccountLightbox} from "./delete-account-lightbox/delete-account-lightbox.component";

@NgModule({
    declarations: [
        UserSettingsPage,
        UserSettingsNavigation,
        UserSettingsForm,
        DeleteAccountLightbox,
    ],
    exports: [
        UserSettingsPage,
    ],
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TgAttachmentsModule,
        TgServicesModule,
        TgPipesModule,
        FormsModule,
        StoreModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            { path: "user-settings/user-profile", component: UserSettingsPage},
        ]),
        // EffectsModule.run(TeamEffects),
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class UserSettingsModule {}
