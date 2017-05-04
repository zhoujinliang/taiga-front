import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";

import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

import {TgBaseModule} from "../../ts/modules/base/base.module";
import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgPipesModule} from "../pipes/pipes.module";

import { AssignedItem } from "./assigned-to/assigned-item/assigned-item.component";
import { AssignedToSelector } from "./assigned-to/assigned-to-selector/assigned-to-selector.component";
import {Avatar} from "./avatar/avatar.component";
import { AvatarService } from "./avatar/avatar.service";
import { BelongToEpics } from "./belong-to-epics/belong-to-epics.component";
import { BoardZoom} from "./board-zoom/board-zoom.component";
import { Card } from "./card/card.component";
import { CardCompletion } from "./card/components/card-completion/card-completion.component";
import { CardData } from "./card/components/card-data/card-data.component";
import { CardOwner } from "./card/components/card-owner/card-owner.component";
import { CardSlideshow } from "./card/components/card-slideshow/card-slideshow.component";
import { CardTags } from "./card/components/card-tags/card-tags.component";
import { CardTasks } from "./card/components/card-tasks/card-tasks.component";
import { CardTitle } from "./card/components/card-title/card-title.component";
import { CardUnfold } from "./card/components/card-unfold/card-unfold.component";
import {FilterCategory} from "./filter/filter-category/filter-category.component";
import {FiltersRemoteStorageService} from "./filter/filter-remote.service";
import {Filter} from "./filter/filter.component";
import { LightboxClose } from "./lightbox/lightbox-close.component";
import { Lightbox } from "./lightbox/lightbox.component";
import {LoaderFull} from "./loader/loader-full.component";
import { ProjectLogoBig } from "./project-logo-big/project-logo-big.component";
import { ProjectLogoSmall } from "./project-logo-small/project-logo-small.component";
import { ProjectMenu } from "./project-menu/project-menu.component";
import { TermsOfServiceAndPrivacyPolicyNotice } from "./terms-of-service-and-privacy-policy-notice/terms-of-service-and-privacy-policy-notice.component";
import { UserDisplay} from "./user-display/user-display.component";
import { PreloadImage} from "./preload-image/preload-image.component";

@NgModule({
    imports: [
        CommonModule,
        TgPipesModule,
        TgCommonModule,
        TgBaseModule,
        RouterModule.forChild([]),
        TranslateModule.forChild({}),
    ],
    exports: [
        Avatar,
        BelongToEpics,
        TermsOfServiceAndPrivacyPolicyNotice,
        ProjectLogoSmall,
        ProjectLogoBig,
        ProjectMenu,
        Card,
        BoardZoom,
        Filter,
        Lightbox,
        LightboxClose,
        AssignedToSelector,
        AssignedItem,
        LoaderFull,
        UserDisplay,
        PreloadImage,
    ],
    declarations: [
        Card,
        CardTags,
        CardOwner,
        CardTitle,
        CardData,
        CardCompletion,
        CardTasks,
        CardSlideshow,
        CardUnfold,
        BoardZoom,
        Avatar,
        BelongToEpics,
        TermsOfServiceAndPrivacyPolicyNotice,
        ProjectLogoSmall,
        ProjectLogoBig,
        ProjectMenu,
        Filter,
        FilterCategory,
        Lightbox,
        LightboxClose,
        AssignedToSelector,
        AssignedItem,
        LoaderFull,
        UserDisplay,
        PreloadImage,
    ],
    providers: [
        AvatarService,
        FiltersRemoteStorageService,
    ],
})
export class TgComponentsModule {}
