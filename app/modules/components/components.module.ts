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
import {FilterCategory} from "./filter/filter-category/filter-category.component";
import {FiltersRemoteStorageService} from "./filter/filter-remote.service";
import {Filter} from "./filter/filter.component";
import { LightboxClose } from "./lightbox/lightbox-close.component";
import { Lightbox } from "./lightbox/lightbox.component";
import { GenericSuccessLightbox } from "./lightbox/generic-success-lightbox/generic-success-lightbox.component";
import {LoaderFull} from "./loader/loader-full.component";
import { ProjectLogoBig } from "./project-logo-big/project-logo-big.component";
import { ProjectLogoSmall } from "./project-logo-small/project-logo-small.component";
import { ProjectMenu } from "./project-menu/project-menu.component";
import { TermsOfServiceAndPrivacyPolicyNotice } from "./terms-of-service-and-privacy-policy-notice/terms-of-service-and-privacy-policy-notice.component";
import { UserDisplay} from "./user-display/user-display.component";
import { PreloadImage} from "./preload-image/preload-image.component";
import {ConfirmAsk} from "./confirm/confirm-ask.component";
import {ConfirmAskChoice} from "./confirm/confirm-ask-choice.component";
import {FieldError} from "./field-error/field-error.component";
import {FeedbackLightbox} from "./feedback/feedback-lightbox.component";
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from "@angular/forms";
import { ColorSelector } from "./color-selector/color-selector.component";
import { CheckPermissionsService } from "./check-permissions/check-permissions.service";
import { IfPermDirective } from "./check-permissions/check-permissions.directive";
import { LoadingDirective, LoadingAux } from "./loading.directive";
import { IssuesBullet } from "./issues-bullet.component";
import { ProgressBar } from "./progress-bar.component";

@NgModule({
    imports: [
        CommonModule,
        TgPipesModule,
        TgCommonModule,
        TgBaseModule,
        FormsModule,
        ReactiveFormsModule,
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
        BoardZoom,
        Filter,
        Lightbox,
        LightboxClose,
        GenericSuccessLightbox,
        AssignedToSelector,
        AssignedItem,
        LoaderFull,
        UserDisplay,
        PreloadImage,
        ConfirmAsk,
        ConfirmAskChoice,
        FieldError,
        FeedbackLightbox,
        ColorSelector,
        IfPermDirective,
        LoadingDirective,
        IssuesBullet,
        ProgressBar,
    ],
    declarations: [
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
        GenericSuccessLightbox,
        AssignedToSelector,
        AssignedItem,
        LoaderFull,
        UserDisplay,
        PreloadImage,
        ConfirmAsk,
        ConfirmAskChoice,
        FieldError,
        FeedbackLightbox,
        ColorSelector,
        IfPermDirective,
        LoadingDirective,
        LoadingAux,
        IssuesBullet,
        ProgressBar,
    ],
    providers: [
        AvatarService,
        FiltersRemoteStorageService,
        CheckPermissionsService,
    ],
    entryComponents: [
        LoadingAux,
    ]
})
export class TgComponentsModule {}
