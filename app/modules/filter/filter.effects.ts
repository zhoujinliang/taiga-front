import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import * as Immutable from "immutable";
import * as _ from "lodash";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ResourcesService } from "../resources/resources.service";
import * as actions from "./filter.actions";
import {AddNotificationMessageAction} from "../common/common.actions";
import {go} from "@ngrx/router-store";
import {genericErrorManagement} from "../utils/effects";

@Injectable()
export class FilterEffects {
    constructor(private actions$: Actions, private rs: ResourcesService) { }
}
