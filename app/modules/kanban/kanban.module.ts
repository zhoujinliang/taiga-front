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
import {KanbanTableHeader} from "./components/kanban-table-header/kanban-table-header.component";
import {KanbanTableBody} from "./components/kanban-table-body/kanban-table-body.component";
import {KanbanBoardZoom} from "./components/kanban-board-zoom/kanban-board-zoom.component";
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
        KanbanTable,
        KanbanTableHeader,
        KanbanTableBody,
        KanbanBoardZoom,
    ],
    providers: [
    ],
})
export class KanbanModule {}
