/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: kanban-board-zoom.directive.coffee
 */

import {Component, Input} from "@angular/core"
import { Store } from "@ngrx/store"
import { ChangeKanbanZoom } from "../../kanban.actions"
import { IState } from "../../../../app.store"

@Component({
    selector: "tg-kanban-board-zoom",
    template: `
        <tg-board-zoom [levels]="levels" [value]="value" (change-zoom)="onChangeZoom($event)">
        </tg-board-zoom>`
})
export class KanbanBoardZoom {
    @Input() value;

    levels = [{
        ref: true,
        subject: false,
        owner: false,
        tags: false,
        extra_info: false,
        unfold: false,
        attachments: false,
        related_tasks: false,
        empty_extra_info: false,
    }, {
        ref: true,
        subject: true,
        owner: false,
        tags: false,
        extra_info: false,
        unfold: false,
        attachments: false,
        related_tasks: false,
        empty_extra_info: false,
    }, {
        ref: true,
        subject: true,
        owner: true,
        tags: true,
        extra_info: true,
        unfold: true,
        attachments: false,
        related_tasks: false,
        empty_extra_info: false,
    }, {
        ref: true,
        subject: true,
        owner: true,
        tags: true,
        extra_info: true,
        unfold: true,
        attachments: true,
        related_tasks: false,
        empty_extra_info: false,
    }, {
        ref: true,
        subject: true,
        owner: true,
        tags: true,
        extra_info: true,
        unfold: true,
        attachments: true,
        related_tasks: true,
        empty_extra_info: true,
    }]

    constructor(private store: Store<IState>) {}

    onChangeZoom(data) {
        this.store.dispatch(new ChangeKanbanZoom(data.level, data.map));
    }
};
