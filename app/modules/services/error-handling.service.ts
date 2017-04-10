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
 * File: error-handling.service.coffee
 */

import * as angular from "angular"

export class ErrorHandlingService {
    rootScope: angular.IScope

    static initClass() {
        this.$inject = [
            "$rootScope"
        ];
    }

    constructor(rootScope) {
        this.rootScope = rootScope;
    }

    init() {
        return this.rootScope.errorHandling = {};
    }

    notfound() {
        this.rootScope.errorHandling.showingError = true;
        return this.rootScope.errorHandling.notfound = true;
    }

    error() {
        this.rootScope.errorHandling.showingError = true;
        return this.rootScope.errorHandling.error = true;
    }

    permissionDenied() {
        this.rootScope.errorHandling.showingError = true;
        return this.rootScope.errorHandling.permissionDenied = true;
    }

    block() {
        this.rootScope.errorHandling.showingError = true;
        return this.rootScope.errorHandling.blocked = true;
    }
}
ErrorHandlingService.initClass();
