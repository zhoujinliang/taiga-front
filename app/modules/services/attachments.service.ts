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
 * File: attachments.service.coffee
 */

import {sizeFormat} from "../../ts/utils"
import * as angular from "angular"

class AttachmentsService {
    confirm:any
    config:any
    translate:any
    rs:any
    maxFileSize:any
    maxFileSizeFormated:any

    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "$tgConfig",
            "$translate",
            "tgResources"
        ];
    }

    constructor(confirm, config, translate, rs) {
        this.confirm = confirm;
        this.config = config;
        this.translate = translate;
        this.rs = rs;
        this.maxFileSize = this.getMaxFileSize();

        if (this.maxFileSize) {
            this.maxFileSizeFormated = sizeFormat(this.maxFileSize);
        }
    }

    sizeError(file) {
        let message = this.translate.instant("ATTACHMENT.ERROR_MAX_SIZE_EXCEEDED", {
            fileName: file.name,
            fileSize: sizeFormat(file.size),
            maxFileSize: this.maxFileSizeFormated
        });

        return this.confirm.notify("error", message);
    }

    validate(file) {
        if (this.maxFileSize && (file.size > this.maxFileSize)) {
            this.sizeError(file);

            return false;
        }

        return true;
    }

    getMaxFileSize() {
        return this.config.get("maxUploadFileSize", null);
    }

    list(type, objId, projectId) {
        return this.rs.attachments.list(type, objId, projectId).then(attachments => {
            return attachments.sortBy(attachment => attachment.get('order'));
        });
    }

    delete(type, id) {
        return this.rs.attachments.delete(type, id);
    }

    saveError(file, data) {
        let message = "";

        if (file) {
            message = this.translate.instant("ATTACHMENT.ERROR_UPLOAD_ATTACHMENT", {
                        fileName: file.name, errorMessage: data.data._error_message
                      });
        }

        return this.confirm.notify("error", message);
    }

    upload(file, objId, projectId, type, from_comment) {
        if (from_comment == null) { from_comment = false; }
        let promise = this.rs.attachments.create(type, projectId, objId, file, from_comment);

        promise.then(null, this.saveError.bind(this, file));

        return promise;
    }

    patch(id, type, patch) {
        let promise = this.rs.attachments.patch(type, id, patch);

        promise.then(null, this.saveError.bind(this, null));

        return promise;
    }
}
AttachmentsService.initClass();

angular.module("taigaCommon").service("tgAttachmentsService", AttachmentsService);
