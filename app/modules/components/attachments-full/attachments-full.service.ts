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
 * File: attachments-full.service.coffee
 */

class AttachmentsFullService extends taiga.Service {
    static initClass() {
        this.$inject = [
            "tgAttachmentsService",
            "$rootScope"
        ];
    }

    constructor(attachmentsService, rootScope) {
        this.attachmentsService = attachmentsService;
        this.rootScope = rootScope;
        this._attachments = Immutable.List();
        this._deprecatedsCount = 0;
        this._attachmentsVisible = Immutable.List();
        this._deprecatedsVisible = false;
        this.uploadingAttachments = [];

        taiga.defineImmutableProperty(this, 'attachments', () => { return this._attachments; });
        taiga.defineImmutableProperty(this, 'deprecatedsCount', () => { return this._deprecatedsCount; });
        taiga.defineImmutableProperty(this, 'attachmentsVisible', () => { return this._attachmentsVisible; });
        taiga.defineImmutableProperty(this, 'deprecatedsVisible', () => { return this._deprecatedsVisible; });
    }

    toggleDeprecatedsVisible() {
        this._deprecatedsVisible = !this._deprecatedsVisible;
        return this.regenerate();
    }

    regenerate() {
        this._deprecatedsCount = this._attachments.count(it => it.getIn(['file', 'is_deprecated']));

        if (this._deprecatedsVisible) {
            return this._attachmentsVisible = this._attachments;
        } else {
            return this._attachmentsVisible = this._attachments.filter(it => !it.getIn(['file', 'is_deprecated']));
        }
    }

    addAttachment(projectId, objId, type, file, editable, comment) {
        if (editable == null) { editable = true; }
        if (comment == null) { comment = false; }
        return new Promise((function(resolve, reject) {
            if (this.attachmentsService.validate(file)) {
                this.uploadingAttachments.push(file);

                let promise = this.attachmentsService.upload(file, objId, projectId, type, comment);
                return promise.then(file => {
                    this.uploadingAttachments = this.uploadingAttachments.filter(function(uploading) {
                        return uploading.name !== file.get('name');
                    });

                    let attachment = Immutable.Map();

                    attachment = attachment.merge({
                        file,
                        editable,
                        loading: false,
                        from_comment: comment
                    });

                    this._attachments = this._attachments.push(attachment);

                    this.regenerate();

                    this.rootScope.$broadcast("attachment:create");

                    return resolve(attachment);
                });
            } else {
                return reject(new Error(file));
            }
        }.bind(this)));
    }

    loadAttachments(type, objId, projectId){
        return this.attachmentsService.list(type, objId, projectId).then(files => {
            this._attachments = files.map(function(file) {
                let attachment = Immutable.Map();

                return attachment.merge({
                    loading: false,
                    editable: false,
                    file
                });
            });

            return this.regenerate();
        });
    }

    deleteAttachment(toDeleteAttachment, type) {
        let onSuccess = () => {
            this._attachments = this._attachments.filter(attachment => attachment !== toDeleteAttachment);

            return this.regenerate();
        };

        return this.attachmentsService.delete(type, toDeleteAttachment.getIn(['file', 'id'])).then(onSuccess);
    }

    reorderAttachment(type, attachment, newIndex) {
        let oldIndex = this.attachments.findIndex(it => it === attachment);
        if (oldIndex === newIndex) { return; }

        let attachments = this.attachments.remove(oldIndex);
        attachments = attachments.splice(newIndex, 0, attachment);
        attachments = attachments.map((x, i) => x.setIn(['file', 'order'], i + 1));

        let promises = [];
        attachments.forEach(attachment => {
            let patch = {order: attachment.getIn(['file', 'order'])};

            return promises.push(this.attachmentsService.patch(attachment.getIn(['file', 'id']), type, patch));
        });
            
        return Promise.all(promises).then(() => {
            this._attachments = attachments;

            return this.regenerate();
        });
    }

    updateAttachment(toUpdateAttachment, type) {
        let index = this._attachments.findIndex(attachment => attachment.getIn(['file', 'id']) === toUpdateAttachment.getIn(['file', 'id']));

        let oldAttachment = this._attachments.get(index);

        let patch = taiga.patch(oldAttachment.get('file'), toUpdateAttachment.get('file'));

        if (toUpdateAttachment.get('loading')) {
            this._attachments = this._attachments.set(index, toUpdateAttachment);

            return this.regenerate();
        } else {
            return this.attachmentsService.patch(toUpdateAttachment.getIn(['file', 'id']), type, patch).then(() => {
                this._attachments = this._attachments.set(index, toUpdateAttachment);

                return this.regenerate();
            });
        }
    }
}
AttachmentsFullService.initClass();

angular.module("taigaComponents").service("tgAttachmentsFullService", AttachmentsFullService);
