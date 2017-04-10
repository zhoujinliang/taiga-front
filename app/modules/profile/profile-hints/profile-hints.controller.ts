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
 * File: profile-hints.controller.coffee
 */

import * as angular from "angular"

export class ProfileHintsController {
    translate:any
    HINTS:any
    hintKey:any
    hint:any

    static initClass() {
        this.prototype.HINTS = [
            { //hint1
                url: "https://tree.taiga.io/support/admin/import-export-projects/"
            },
            { //hint2
                url: "https://tree.taiga.io/support/admin/custom-fields/"
            },
            { //hint3
            },
            { //hint4
            }
        ];
    }
    constructor(translate) {
        this.translate = translate;
        let hintKey = Math.floor(Math.random() * this.HINTS.length) + 1;

        this.hint = this.HINTS[hintKey - 1];

        this.hint.linkText = this.hint.linkText || 'HINTS.LINK';

        this.hint.title = this.translate.instant(`HINTS.HINT${hintKey}_TITLE`);

        this.hint.text = this.translate.instant(`HINTS.HINT${hintKey}_TEXT`);
    }
}
ProfileHintsController.initClass();

ProfileHintsController.$inject = [
    "$translate"
];
