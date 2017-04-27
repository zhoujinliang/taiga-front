import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import { TgCommonModule } from "../../ts/modules/common/common.module";
import { TgComponentsModule } from "../components/components.module";

import { LikeProjectButton } from "./components/like-project-button/like-project-button.component";
import { ProjectsListing } from "./listing/projects-listing.component";
import { ProjectData } from "./project/data/project-data.component";
import { ProjectInfo } from "./project/info/project-info.component";
import { ProjectDetail } from "./project/project.component";
import { ProjectTags } from "./project/tags/project-tags.component";
import { CurrentProjectsEffects } from "./projects.effects";

@NgModule({
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            {path: "project/:slug", component: ProjectDetail},
            {path: "projects", component: ProjectsListing},
        ]),
        EffectsModule.run(CurrentProjectsEffects),
    ],
    exports: [
        ProjectsListing,
        ProjectDetail,
    ],
    declarations: [
        ProjectsListing,
        ProjectDetail,
        ProjectInfo,
        ProjectData,
        ProjectTags,
        LikeProjectButton,
    ],
    providers: [
    ],
})
export class ProjectsModule {}
