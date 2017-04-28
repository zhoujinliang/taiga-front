import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { BlockingMessageInput } from "./blocking-messsage-input.component";
import { Capslock } from "./capslock.component";
import { CheckPermission } from "./check-permissions.directive";
import { DateRange } from "./components";
import { NotificationMessages } from "./confirm.component";
import { UsEstimationForLightbox } from "./estimation/us-estimation-for-lightbox.component";
import { UsEstimationPointsPopover } from "./estimation/us-estimation-points-popover.component";
import { MainTitle } from "./main-title.component";
import { MessageFormatPipe } from "./message-format.pipe";
import { ProjectUrlService } from "./project-url.service";
import { Svg } from "./svg.component";
import { ColorizeBacklogTag, ColorizeBacklogTags } from "./tags.component";

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
        ProjectUrlService,
    ],
})
export class TgCommonModule {}
