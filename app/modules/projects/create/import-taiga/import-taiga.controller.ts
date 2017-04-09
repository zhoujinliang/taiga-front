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
 * File: import-project.controller.coffee
 */

export class ImportTaigaController {
    confirm:any
    rs:any
    importProjectService:any
    translate:any

    static initClass() {
        this.$inject = [
            '$tgConfirm',
            '$tgResources',
            'tgImportProjectService',
            '$translate'
        ];
    }

    constructor(confirm, rs, importProjectService, translate) {
        this.confirm = confirm;
        this.rs = rs;
        this.importProjectService = importProjectService;
        this.translate = translate;
    }

    importTaiga(files) {
        let file = files[0];

        let loader = this.confirm.loader(this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.TITLE'), this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.DESCRIPTION'), true);

        loader.start();

        let promise = this.rs.projects.import(file, loader.update);

        this.importProjectService.importPromise(promise).finally(() => loader.stop());

    }
}
ImportTaigaController.initClass();
