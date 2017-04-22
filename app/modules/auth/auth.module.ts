import {NgModule} from "@angular/core"
import {RouterModule} from "@angular/router"
import {CommonModule} from "@angular/common"
import {TranslateModule} from "@ngx-translate/core"
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { TgCommonModule } from "../../ts/modules/common/common.module";
import { TgComponentsModule } from "../components/components.module";

import { LoginPage } from './login/login.component';
import { LoginForm } from './login/login-form.component';
import { PublicRegisterMessage} from './login/public-register-message.component';

import {AuthEffects} from "./auth.effects"

@NgModule({
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            {path: "login", component: LoginPage},
        ]),
        EffectsModule.run(AuthEffects),
    ],
    exports: [
        LoginPage,
    ],
    declarations: [
        LoginPage,
        LoginForm,
        PublicRegisterMessage,
    ],
    providers: [
    ],
})
export class AuthModule {}
