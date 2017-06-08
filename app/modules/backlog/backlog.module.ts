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
import {BacklogPage} from "./backlog.component";
import {BacklogEffects} from "./backlog.effects";
import {BacklogSummary} from "./backlog-summary.component";
import {BacklogMenu} from "./backlog-menu.component";
import {BacklogTable} from "./backlog-table.component";
import {BacklogRow} from "./backlog-row.component";
import {BacklogProgressBar} from "./backlog-progress-bar.component";
import {BacklogBurndownGraph} from "./backlog-burndown-graph.component";

@NgModule({
    declarations: [
        BacklogPage,
        BacklogSummary,
        BacklogMenu,
        BacklogTable,
        BacklogRow,
        BacklogProgressBar,
        BacklogBurndownGraph,
    ],
    exports: [
        BacklogPage,
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
            { path: "project/:slug/backlog", component: BacklogPage },
        ]),
        EffectsModule.run(BacklogEffects),
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class BacklogModule {}
