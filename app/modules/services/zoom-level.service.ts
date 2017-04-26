import {Injectable} from "@angular/core"
import * as _ from "lodash";

@Injectable()
export class ZoomLevelService {
    zooms:any

    constructor() {
        this.zooms = {
            kanban: [
                ["ref"],
                ["subject"],
                ["owner", "tags", "extra_info", "unfold"],
                ["attachments"],
                ["related_tasks", "empty_extra_info"]
            ],
        }
    }

    getVisibility(section, level) {
        if (this.zooms[section]) {
            let perms: any[] = _.flatten(this.zooms[section].slice(0, level + 1))
            return this.toMap(perms);
        }
        return {};
    }

    toMap(list:string[]):any {
        let result = {}
        for (let item of list) {
            result[item] = true
        }
        return result;
    }

    numOfLevels(section) {
        if (this.zooms[section]) {
            return this.zooms[section].length;
        }
        return 0;
    }
}
