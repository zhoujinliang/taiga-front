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

import * as angular from "angular"
import * as moment from "moment"

class AttachmentController {
    attachmentsService:any
    translate:any
    form:any
    attachment:any
    title:any
    onUpdate:any
    onDelete:any

    static initClass() {
        this.$inject = [
            'tgAttachmentsService',
            '$translate'
        ];
    }

    constructor(attachmentsService, translate) {
        this.attachmentsService = attachmentsService;
        this.translate = translate;
        this.form = {};
        this.form.description = this.attachment.getIn(['file', 'description']);
        this.form.is_deprecated = this.attachment.get(['file', 'is_deprecated']);

        this.title = this.translate.instant("ATTACHMENT.TITLE", {
            fileName: this.attachment.get('name'),
            date: moment(this.attachment.get('created_date')).format(this.translate.instant("ATTACHMENT.DATE"))
        });
    }

    editMode(mode) {
        let attachment = this.attachment.set('editable', mode);
        return this.onUpdate({attachment});
    }

    delete() {
        return this.onDelete({attachment: this.attachment});
    }

    save() {
        let attachment = this.attachment.set('loading', true);

        this.onUpdate({attachment});

        attachment = this.attachment.merge({
            editable: false,
            loading: false
        });

        attachment = attachment.mergeIn(['file'], {
            description: this.form.description,
            is_deprecated: !!this.form.is_deprecated
        });

        return this.onUpdate({attachment});
    }
}
AttachmentController.initClass();

angular.module('taigaComponents').controller('Attachment', AttachmentController);
