import {Component} from "@angular/core"

@Component({
    template: require('./kanban.jade')()
})
export class KanbanPage {
    section = "kanban";
}
