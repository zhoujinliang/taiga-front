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
 * File: attchments-simple.controller.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

export class AttachmentsSimpleController {
    attachmentsService:any
    attachments:any
    onAdd:any
    onDelete:any

    static initClass() {
        this.$inject = [
            "tgAttachmentsService"
        ];
    }

    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }

    addAttachment(file) {
        let attachment = Immutable.fromJS({
            file,
            name: file.name,
            size: file.size
        });

        if (this.attachmentsService.validate(file)) {
            this.attachments = this.attachments.push(attachment);

            if (this.onAdd) { return this.onAdd({attachment}); }
        }
    }

    addAttachments(files) {
        return _.forEach(files, this.addAttachment.bind(this));
    }

    deleteAttachment(toDeleteAttachment) {
        this.attachments = this.attachments.filter(attachment => attachment !== toDeleteAttachment);

        if (this.onDelete) { return this.onDelete({attachment: toDeleteAttachment}); }
    }
}
AttachmentsSimpleController.initClass();
