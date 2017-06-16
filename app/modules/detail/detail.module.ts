import {CommonModule} from "@angular/common";
import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgCardsModule} from "../cards/cards.module";
import {TgComponentsModule} from "../components/components.module";
import {TgServicesModule} from "../services/services.module";
import {DetailUserstoryPage} from "./detail-userstory.component";
import {DetailVoteButton} from "./components/detail-vote-button.component";
import {DetailHeader} from "./components/detail-header.component";
import {DetailEffects} from "./detail.effects";

@NgModule({
    declarations: [
        DetailUserstoryPage,
        DetailVoteButton,
        DetailHeader,
    ],
    exports: [
        DetailUserstoryPage,
    ],
    imports: [
        CommonModule,
        TgCommonModule,
        TgCardsModule,
        TgComponentsModule,
        TgServicesModule,
        FormsModule,
        StoreModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            { path: "project/:slug/us/:ref", component: DetailUserstoryPage },
        ]),
        EffectsModule.run(DetailEffects),
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class DetailModule {}
