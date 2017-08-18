import {Component, Input} from "@angular/core";
import * as Immutable from "immutable";

@Component({
    selector: "tg-filter-save-custom",
    template: require("./filter-save-custom.pug")(),
})
export class FilterSaveCustom {
    customFilterForm:boolean = false;
    customFilterName:string = "";

    saveCustomFilter() {
    }
}
