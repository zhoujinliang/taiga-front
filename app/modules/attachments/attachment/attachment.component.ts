/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: attchment.controller.coffee
 */

import * as moment from "moment";
import * as Immutable from "immutable";
import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    selector: "tg-attachment",
    template: require("./attachment.pug")(),
})
export class Attachment {
    @Input() attachment: Immutable.Map<string, any>;
    @Output() update: EventEmitter<any>;
    @Output() delete: EventEmitter<number>;
    @Output() preview: EventEmitter<any>;
    editable: boolean;

    constructor() {
        this.update = new EventEmitter();
        this.delete = new EventEmitter();
        this.preview = new EventEmitter();
    }

    editMode(mode) {
        this.editable = mode;
    }

    updateAttachment(event, description, is_deprecated) {
        event.preventDefault();
        this.editable = false;
        this.update.emit({attachmentId: this.attachment.get('id'),
                          description,
                          is_deprecated});
        return false;
    }
}
