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
 * File: modules/components/wysiwyg/wysiwyg-mention.service.coffee
 */

import {slugify} from "../../../ts/utils"
import * as angular from "angular"
import * as _ from "lodash"

class WysiwygMentionService {
    projectService:any
    wysiwygService:any
    navurls:any
    rs:any
    cancelablePromise:any

    static initClass() {
        this.$inject = [
            "tgProjectService",
            "tgWysiwygService",
            "$tgNavUrls",
            "$tgResources"
        ];
    }

    constructor(projectService, wysiwygService, navurls, rs) {
        this.projectService = projectService;
        this.wysiwygService = wysiwygService;
        this.navurls = navurls;
        this.rs = rs;
        this.cancelablePromise = null;
    }

    searchEmoji(name, cb) {
        let filteredEmojis = this.wysiwygService.searchEmojiByName(name);
        filteredEmojis = filteredEmojis.slice(0, 10);

        return cb(filteredEmojis);
    }

    searchUser(term, cb) {
        let searchProps = ['username', 'full_name', 'full_name_display'];

        let users = this.projectService.project.toJS().members.filter(user => {
            for (let prop of searchProps) {
                if (slugify(user[prop]).indexOf(term) >= 0) {
                    return true;
                } else if (user[prop].indexOf(term) >= 0) {
                    return true;
                }
            }

            return false;
        });

        users = users.slice(0, 10).map(it => {
            it.url = this.navurls.resolve('user-profile', {
                project: this.projectService.project.get('slug'),
                username: it.username
            });

            return it;
         });

        return cb(users);
    }

    searchItem(term) {
        return new Promise((function(resolve, reject) {
            term = slugify(term);

            let searchTypes = ['issues', 'tasks', 'userstories'];

            let urls = {
                issues: "project-issues-detail",
                tasks: "project-tasks-detail",
                userstories: "project-userstories-detail"
            };

            let searchProps = ['ref', 'subject'];

            let filter = item => {
                for (let prop of searchProps) {
                    if (slugify(item[prop]).indexOf(term) >= 0) {
                        return true;
                    }
                }
                return false;
            };

            if (this.cancelablePromise) { this.cancelablePromise.abort(); }

            this.cancelablePromise = this.rs.search.do(this.projectService.project.get('id'), term);

            return this.cancelablePromise.then(res => {
                // ignore wikipages if they're the only results. can't exclude them in search
                if ((res.count < 1) || (res.count === res.wikipages.length)) {
                    return resolve([]);
                } else {
                    let result = [];
                    for (var type of searchTypes) {
                        if (res[type] && (res[type].length > 0)) {
                            let items = res[type].filter(filter);
                            items = items.map(it => {
                                it.url = this.navurls.resolve(urls[type], {
                                    project: this.projectService.project.get('slug'),
                                    ref: it.ref
                                });

                                return it;
                            });

                            result = result.concat(items);
                        }
                    }

                    result = _.sortBy(result, ["ref"]);

                    return resolve(result.slice(0, 10));
                }
            });
        }.bind(this)));
    }


    search(mention) {
        return new Promise((function(resolve) {
            if ('#'.indexOf(mention[0]) !== -1) {
                return this.searchItem(mention.replace('#', '')).then(resolve);
            } else if ('@'.indexOf(mention[0]) !== -1) {
                return this.searchUser(mention.replace('@', ''), resolve);
            } else if (':'.indexOf(mention[0]) !== -1) {
                return this.searchEmoji(mention.replace(':', ''), resolve);
            }
        }.bind(this)));
    }
}
WysiwygMentionService.initClass();


angular.module("taigaComponents").service("tgWysiwygMentionService", WysiwygMentionService);
