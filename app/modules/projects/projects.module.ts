import {CommonModule} from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import { TgCommonModule } from "../common/common.module";
import { TgComponentsModule } from "../components/components.module";
import { TgUserTimelineModule } from "../user-timeline/user-timeline.module";

import { LikeProjectButton } from "./components/like-project-button/like-project-button.component";
import { WatchProjectButton } from "./components/watch-project-button/watch-project-button.component";
import { ContactProjectButton } from "./components/contact-project-button/contact-project-button.component";
import { ProjectsListing } from "./listing/projects-listing.component";
import { ProjectData } from "./project-detail/data/project-data.component";
import { ProjectInfo } from "./project-detail/info/project-info.component";
import { ProjectDetailPage } from "./project-detail/project-detail.component";
import { CreateProjectPage } from "./create/create-project.component";
import { ProjectTags } from "./project-detail/tags/project-tags.component";
import { ProjectContactLightbox} from "./components/lb-contact-project/lb-contact-project.component";
import { CurrentProjectsEffects } from "./projects.effects";

import { CreateProjectFormActions } from "./create/components/create-project-form-actions";
import { CreateProjectFormDescription } from "./create/components/create-project-form-description";
import { CreateProjectFormLinks } from "./create/components/create-project-form-links";
import { CreateProjectFormName } from "./create/components/create-project-form-name";
import { CreateProjectFormBaseProject } from "./create/components/create-project-form-base-project";
import { CreateProjectFormPrivacy } from "./create/components/create-project-form-privacy";
import { CreateProjectFormPage } from "./create/create-project-form/create-project-form.component";
import { CreateProjectRestrictions} from "./create/create-project-restrictions/create-project-restrictions.component";

@NgModule({
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TgUserTimelineModule,
        ReactiveFormsModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            {path: "project/new", component: CreateProjectPage},
            {path: "project/new/:type", component: CreateProjectFormPage},
            {path: "project/:slug", component: ProjectDetailPage},
            {path: "projects", component: ProjectsListing},
        ]),
        EffectsModule.forFeature([CurrentProjectsEffects]),
    ],
    exports: [
        ProjectsListing,
        ProjectDetailPage,
        CreateProjectPage,
        CreateProjectFormPage,
    ],
    declarations: [
        ProjectsListing,
        ProjectDetailPage,
        ProjectContactLightbox,
        CreateProjectPage,
        CreateProjectFormPage,
        ProjectInfo,
        ProjectData,
        ProjectTags,
        LikeProjectButton,
        WatchProjectButton,
        ContactProjectButton,
        CreateProjectFormActions,
        CreateProjectFormDescription,
        CreateProjectFormLinks,
        CreateProjectFormName,
        CreateProjectFormBaseProject,
        CreateProjectFormPrivacy,
        CreateProjectRestrictions,
    ],
    providers: [
    ],
})
export class ProjectsModule {}
