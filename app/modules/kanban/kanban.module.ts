import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import { EffectsModule } from '@ngrx/effects';
import { FormsModule }   from '@angular/forms';

import {TgCommonModule} from '../../ts/modules/common/common.module';
import {TgComponentsModule} from '../components/components.module';
import {KanbanPage} from "./kanban.component";
import {KanbanTable} from "./components/kanban-table/kanban-table.component";
import {KanbanEffects} from "./kanban.effects";

@NgModule({
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        FormsModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            { path: "project/:slug/kanban", component: KanbanPage },
        ]),
        EffectsModule.run(KanbanEffects),
    ],
    exports: [
        KanbanPage,
    ],
    declarations: [
        KanbanPage,
        KanbanTable
    ],
    providers: [
    ],
})
export class KanbanModule {}
