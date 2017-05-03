import {NgModule} from "@angular/core";

import {MomentFormatPipe} from "./moment-format.pipe";
import {SizeFormatPipe} from "./size-format.pipe";

@NgModule({
    imports: [
    ],
    exports: [
        MomentFormatPipe,
        SizeFormatPipe,
    ],
    declarations: [
        MomentFormatPipe,
        SizeFormatPipe,
    ],
    providers: [
    ],
})
export class TgPipesModule {}
