import {Component, Input} from "@angular/core";
import { Store } from "@ngrx/store";
import {Observable, Subscription} from "rxjs";
import { IState } from "../../../app.store";

@Component({
    selector: "tg-lightbox",
    template: `<div class="lightbox" [class.open]="isOpen|async">
                 <ng-content></ng-content>
               </div>`,
})
export class Lightbox {
    @Input() key: string;
    public isOpen: Observable<boolean>;

    constructor(private store: Store<IState>) {
        this.isOpen = this.store.select((state) => state.getIn(["global", "open-lightbox"]))
                                .map((openLightbox) => openLightbox === this.key);
    }
}
