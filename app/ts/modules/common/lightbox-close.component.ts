import {Component, Output, EventEmitter} from "@angular/core"

@Component({
    selector: "tg-lightbox-close",
    template: `
        <a class="close" ng-click="close()" href="" title="{{'COMMON.CLOSE' | translate}}">
            <tg-svg svg-icon="icon-close"></tg-svg>
        </a>`
})
export class LightboxClose {
    @Output("on-close") onClose = new EventEmitter();

    constructor() {
        this.onClose = new EventEmitter();
    }

    close() {
        this.onClose.emit()
    }
}

