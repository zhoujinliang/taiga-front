import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { SetUserAction, SetProjectsAction } from "./app.actions";
import * as Immutable from "immutable";
import {StorageService} from "./ts/modules/base/storage"
import { ResourcesService } from "./modules/resources/resources.service";

@Injectable()
export class GlobalEffects {
    constructor(private storage: StorageService, private rs: ResourcesService, private actions$: Actions) {}
}
