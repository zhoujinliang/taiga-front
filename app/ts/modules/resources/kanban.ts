/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
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
 * File: modules/resources/kanban.coffee
 */

import {generateHash} from "../../app"

export function KanbanResourcesProvider($storage) {
    let service:any = {};
    let hashSuffixStatusViewModes = "kanban-statusviewmodels";
    let hashSuffixStatusColumnModes = "kanban-statuscolumnmodels";

    service.storeStatusColumnModes = function(projectId, params) {
        let ns = `${projectId}:${hashSuffixStatusColumnModes}`;
        let hash = generateHash([projectId, ns]);
        return $storage.set(hash, params);
    };

    service.getStatusColumnModes = function(projectId) {
        let ns = `${projectId}:${hashSuffixStatusColumnModes}`;
        let hash = generateHash([projectId, ns]);
        return $storage.get(hash) || {};
    };

    return instance => instance.kanban = service;
};
