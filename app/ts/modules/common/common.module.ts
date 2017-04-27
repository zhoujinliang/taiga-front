import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { Svg } from "./svg.component";
import { NotificationMessages } from "./confirm.component";
import { Capslock } from "./capslock.component";
import { ProjectUrlService } from './project-url.service';
import { ColorizeBacklogTag, ColorizeBacklogTags } from './tags.component';
import { DateRange } from './components';
import { MainTitle } from "./main-title.component";
import { MessageFormatPipe } from "./message-format.pipe";
import { CheckPermission } from "./check-permissions.directive";
import { BlockingMessageInput } from "./blocking-messsage-input.component";
import { UsEstimationForLightbox } from "./estimation/us-estimation-for-lightbox.component";
import { UsEstimationPointsPopover } from "./estimation/us-estimation-points-popover.component";

@NgModule({
    imports: [
        CommonModule,
        TranslateModule.forChild({}),
    ],
    exports: [
        ColorizeBacklogTags,
        DateRange,
        Svg,
        MainTitle,
        MessageFormatPipe,
        Capslock,
        NotificationMessages,
        CheckPermission,
        BlockingMessageInput,
        UsEstimationForLightbox,
        UsEstimationPointsPopover,
    ],
    declarations: [
        ColorizeBacklogTag,
        ColorizeBacklogTags,
        DateRange,
        Svg,
        MainTitle,
        MessageFormatPipe,
        Capslock,
        NotificationMessages,
        CheckPermission,
        BlockingMessageInput,
        UsEstimationForLightbox,
        UsEstimationPointsPopover,
    ],
    providers: [
        ProjectUrlService
    ]
})
export class TgCommonModule {}
