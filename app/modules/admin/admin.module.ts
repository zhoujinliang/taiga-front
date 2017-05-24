import {CommonModule} from "@angular/common";
import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {RouterModule} from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import {TranslateModule} from "@ngx-translate/core";

import {TgCommonModule} from "../../ts/modules/common/common.module";
import {TgPipesModule} from "../pipes/pipes.module";
import {TgComponentsModule} from "../components/components.module";
import {TgAttachmentsModule} from "../attachments/attachments.module";
import {TgServicesModule} from "../services/services.module";

import {AdminNav} from "./components/admin-nav/admin-nav.component";
import {AdminSubnavProject} from "./components/admin-subnav-project/admin-subnav-project.component";

import {AdminProjectDetailsPage} from "./pages/project/project-details/project-details.component";
import {AdminDefaultValuesPage} from "./pages/project/default-values/default-values.component";
import {AdminDefaultValuesForm} from "./pages/project/default-values/default-values-form.component";
import {AdminModulesPage} from "./pages/project/modules/modules.component";
import {AdminModulesForm} from "./pages/project/modules/modules-form.component";
import {AdminExportPage} from "./pages/project/export/export.component";
import {AdminReportsPage} from "./pages/project/reports/reports.component";
import {AdminReportsItem} from "./pages/project/reports/reports-item.component";
import {AdminPermissionsPage} from "./pages/permissions/permissions.component";
import {AdminEditRole} from "./pages/permissions/permissions-edit-role.component";
import {AdminEditRolePermissions} from "./pages/permissions/permissions-edit-role-permissions.component";
import {AdminRolesNav} from "./pages/permissions/permissions-roles-nav.component";

@NgModule({
    declarations: [
        AdminProjectDetailsPage,
        AdminDefaultValuesPage,
        AdminDefaultValuesForm,
        AdminModulesPage,
        AdminModulesForm,
        AdminExportPage,
        AdminReportsPage,
        AdminReportsItem,
        AdminPermissionsPage,
        AdminEditRole,
        AdminEditRolePermissions,
        AdminRolesNav,
        AdminNav,
        AdminSubnavProject,
    ],
    exports: [
        AdminProjectDetailsPage,
        AdminDefaultValuesPage,
        AdminModulesPage,
        AdminExportPage,
        AdminReportsPage,
        AdminPermissionsPage,
    ],
    imports: [
        CommonModule,
        TgCommonModule,
        TgComponentsModule,
        TgAttachmentsModule,
        TgServicesModule,
        TgPipesModule,
        FormsModule,
        StoreModule,
        TranslateModule.forChild({}),
        RouterModule.forChild([
            { path: "project/:slug/admin", redirectTo: "project/:slug/admin/project-profile/details"},
            { path: "project/:slug/admin/project-profile/details", component: AdminProjectDetailsPage },
            { path: "project/:slug/admin/project-profile/default-values", component: AdminDefaultValuesPage },
            { path: "project/:slug/admin/project-profile/modules", component: AdminModulesPage },
            { path: "project/:slug/admin/project-profile/export", component: AdminExportPage },
            { path: "project/:slug/admin/project-profile/reports", component: AdminReportsPage },
            { path: "project/:slug/admin/roles", component: AdminPermissionsPage },
        ]),
        // EffectsModule.run(AdminEffects),
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AdminModule {}
