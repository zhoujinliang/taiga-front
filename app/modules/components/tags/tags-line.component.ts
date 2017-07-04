import {Component, Input, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import * as Immutable from "immutable";
import * as _ from "lodash";

@Component({
    selector: "tg-tags-line",
    template: require("./tags-line.pug")(),
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TagsLine),
        multi: true
      }
    ]
})
export class TagsLine implements ControlValueAccessor {
    @Input() disableColorSelection: boolean = false;
    @Input() canEdit: boolean;
    addTag: boolean;
    _tags: Immutable.List<any>;
    onChange: any;

    set tags(val: Immutable.List<any>) {
        this._tags = val;
        this.onChange(val);
    }

    get tags() {
        return this._tags;
    }

    writeValue(value: Immutable.List<any>) {
        if (value) {
            this.tags = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched() {}

    onDeleteTag(tag) {
        this._tags = this._tags.filter((t) => t == tag).toList();
    }

    addNewTag(tag) {
        this._tags = this._tags.push(Immutable.fromJS(tag));
    }
}
