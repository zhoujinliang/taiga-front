import {Component, Output, EventEmitter} from "@angular/core";

@Component({
    host: {"class": "lightbox-delete-account"},
    selector: "tg-delete-account-lightbox",
    template: require("./delete-account-lightbox.pug")(),
})
export class DeleteAccountLightbox {
    @Output() response: EventEmitter<boolean>;

    constructor() {
        this.response = new EventEmitter();
    }
}
