import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { TranslateModule } from "@ngx-translate/core"
import { Svg } from "./svg.component"
import { NotificationMessages } from "./confirm.component"
import { Capslock } from "./capslock.component"
import { LightboxClose } from './lightbox-close.component';
import { ProjectUrlService } from './project-url.service';
import { ColorizeBacklogTag, ColorizeBacklogTags } from './tags.component';
import { DateRange } from './components';
import { MainTitle } from "./main-title.component"
import { MessageFormatPipe } from "./message-format.pipe"

@NgModule({
    imports: [
        CommonModule,
        TranslateModule.forChild({}),
    ],
    exports: [
        ColorizeBacklogTags,
        DateRange,
        Svg,
        LightboxClose,
        MainTitle,
        MessageFormatPipe,
        Capslock,
        NotificationMessages,
    ],
    declarations: [
        ColorizeBacklogTag,
        ColorizeBacklogTags,
        DateRange,
        Svg,
        LightboxClose,
        MainTitle,
        MessageFormatPipe,
        Capslock,
        NotificationMessages,
    ],
    providers: [
        ProjectUrlService
    ]
})
export class TgCommonModule {}
