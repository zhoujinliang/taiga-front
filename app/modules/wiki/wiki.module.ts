import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgComponentsModule} from "../components/components.module";
import {TgServicesModule} from "../services/services.module";
import {WikiPage} from "./wiki.component";
import {WikiNav} from "./wiki-nav/wiki-nav.component";
import {WikiEffects} from "./wiki.effects";

@NgModule({
    declarations: [
        WikiPage,
        WikiNav,
    ],
    exports: [
        WikiPage,
    ],
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TgServicesModule,
        FormsModule,
        StoreModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            { path: "project/:slug/wiki", redirectTo: "project/:slug/wiki/home"},
            { path: "project/:slug/wiki/:page", component: WikiPage },
        ]),
        EffectsModule.run(WikiEffects),
    ],
    providers: [
    ],
})
export class WikiModule {}
