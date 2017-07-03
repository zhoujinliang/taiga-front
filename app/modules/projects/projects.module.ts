import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import { TgCommonModule } from "../../ts/modules/common/common.module";
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
import { CurrentProjectsEffects } from "./projects.effects";

@NgModule({
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TgUserTimelineModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            {path: "project/new", component: CreateProjectPage},
            {path: "project/:slug", component: ProjectDetailPage},
            {path: "projects", component: ProjectsListing},
        ]),
        EffectsModule.run(CurrentProjectsEffects),
    ],
    exports: [
        ProjectsListing,
        ProjectDetailPage,
        CreateProjectPage,
    ],
    declarations: [
        ProjectsListing,
        ProjectDetailPage,
        CreateProjectPage,
        ProjectInfo,
        ProjectData,
        ProjectTags,
        LikeProjectButton,
        WatchProjectButton,
        ContactProjectButton,
    ],
    providers: [
    ],
})
export class ProjectsModule {}
