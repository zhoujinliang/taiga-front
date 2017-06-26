import {NgModule} from "@angular/core";

import {TgCommonModule} from "../common/common.module";

import {ConfigurationService} from "./conf";
import {HttpService} from "./http";
import {ModelService} from "./model";
import {RepositoryService} from "./repository";
import {StorageService} from "./storage";
import {UrlsService} from "./urls";

@NgModule({
    exports: [
    ],
    declarations: [
    ],
    providers: [
        UrlsService,
        StorageService,
        RepositoryService,
        ModelService,
        HttpService,
        ConfigurationService,
    ],
})
export class TgBaseModule {}
