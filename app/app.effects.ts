import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import * as Immutable from "immutable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ResourcesService } from "./modules/resources/resources.service";
import {StorageService} from "./ts/modules/base/storage";

@Injectable()
export class GlobalEffects {
    constructor(private storage: StorageService, private rs: ResourcesService, private actions$: Actions) {}
}
