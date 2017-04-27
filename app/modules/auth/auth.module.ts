import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import { TgCommonModule } from "../../ts/modules/common/common.module";
import { TgComponentsModule } from "../components/components.module";

import { ForgotPasswordForm } from "./forgot-password/forgot-password-form.component";
import { ForgotPasswordPage } from "./forgot-password/forgot-password.component";
import { LoginForm } from "./login/login-form.component";
import { LoginPage } from "./login/login.component";
import { PublicRegisterMessage} from "./login/public-register-message.component";

import {AuthEffects} from "./auth.effects";

@NgModule({
    imports: [
        ReactiveFormsModule,
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            {path: "login", component: LoginPage},
            {path: "forgot-password", component: ForgotPasswordPage},
        ]),
        EffectsModule.run(AuthEffects),
    ],
    exports: [
        LoginPage,
        ForgotPasswordPage,
    ],
    declarations: [
        LoginPage,
        LoginForm,
        ForgotPasswordPage,
        ForgotPasswordForm,
        PublicRegisterMessage,
    ],
    providers: [
    ],
})
export class AuthModule {}
