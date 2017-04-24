import {NgModule} from "@angular/core"
import {RouterModule} from "@angular/router"
import {ReactiveFormsModule} from "@angular/forms"
import {CommonModule} from "@angular/common"
import {TranslateModule} from "@ngx-translate/core"
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { TgCommonModule } from "../../ts/modules/common/common.module";
import { TgComponentsModule } from "../components/components.module";

import { LoginPage } from './login/login.component';
import { LoginForm } from './login/login-form.component';
import { ForgotPasswordPage } from './forgot-password/forgot-password.component';
import { ForgotPasswordForm } from './forgot-password/forgot-password-form.component';
import { PublicRegisterMessage} from './login/public-register-message.component';

import {AuthEffects} from "./auth.effects"

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
