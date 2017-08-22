import {ChangeDetectionStrategy, Component, Input, OnChanges} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-filter-save-custom",
    template: require("./filter-save-custom.pug"),
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSaveCustom implements OnChanges {
    @Input() appliedFilters: Immutable.List<any>;
    customFilterForm:boolean = false;
    customFilterName:string = "";

    saveCustomFilter() {
        console.log(this.customFilterName);
    }

    ngOnChanges(changes) {
        if (changes.appliedFilters) {
            this.customFilterForm = false;
            this.customFilterName = "";
        }
    }
}
