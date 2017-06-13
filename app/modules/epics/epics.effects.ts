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
import { StorageService} from "../../ts/modules/base/storage";
import {FiltersRemoteStorageService} from "../components/filter/filter-remote.service";
import { ResourcesService } from "../resources/resources.service";
import * as actions from "./epics.actions";

@Injectable()
export class EpicsEffects {
    @Effect()
    fetchEpics$: Observable<Action> = this.actions$
        .ofType("FETCH_EPICS")
        .map(toPayload)
        .switchMap((payload) => {
          return this.rs.epics.list(payload).map((epics) => {
              return new actions.SetEpicsAction(epics.data);
          });
        });

    @Effect()
    fetchEpicUserStories$: Observable<Action> = this.actions$
        .ofType("FETCH_EPIC_USER_STORIES")
        .map(toPayload)
        .switchMap((payload) => {
          let params = {
              epic: payload,
              include_tasks: true,
              order_by: 'epic_order'
          }
          return this.rs.userstories.listInAllProjects(params).map((userstories) => {
              return new actions.SetEpicUserStoriesAction(payload, userstories.data);
          });
        });

    constructor(private actions$: Actions,
                private rs: ResourcesService,
                private storage: StorageService,
                private filtersRemoteStorage: FiltersRemoteStorageService) { }
}
