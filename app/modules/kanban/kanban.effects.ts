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
import * as actions from "./kanban.actions";

@Injectable()
export class KanbanEffects {
    @Effect()
    fetchKanbanUserStories$: Observable<Action> = this.actions$
        .ofType("FETCH_KANBAN_USER_STORIES")
        .map(toPayload)
        .switchMap((payload) => {
          const params = _.extend({
              include_attachments: 1,
              include_tasks: 1,
          }, payload.appliedFilters.toJS());
          return this.rs.userstories.listAll(payload.projectId, params).map((userstories) => {
              return new actions.SetKanbanUserStoriesAction(userstories.data);
          });
        });

    @Effect()
    fetchKanbanFiltersData$: Observable<Action> = this.actions$
        .ofType("FETCH_KANBAN_FILTERS_DATA")
        .map(toPayload)
        .switchMap((payload) => {
          const data = _.extend({project: payload.projectId}, payload.appliedFilters.toJS());
          return this.rs.userstories.filtersData(data).map((filtersData) => {
              return new actions.SetKanbanFiltersDataAction(filtersData);
          });
        });

    @Effect()
    fetchKanbanAppliedFilters: Observable<Action> = this.actions$
        .ofType("FETCH_KANBAN_APPLIED_FILTERS")
        .map(toPayload)
        .switchMap((projectId) => {

          return this.filtersRemoteStorage.getFilters(projectId, "kanban").map((filtersData) => {
              return new actions.SetKanbanAppliedFiltersAction(filtersData);
          });
        });

    @Effect()
    changeKanbanZoom$: Observable<Action> = this.actions$
        .ofType("CHANGE_KANBAN_ZOOM")
        .map(toPayload)
        .do((payload) => {
            this.storage.set("kanban_zoom", payload);
        }).map((payload) => {
            return new actions.SetKanbanZoom(payload);
        });

    @Effect()
    usBulkCreate$: Observable<Action> = this.actions$
        .ofType("US_BULK_CREATE")
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.userstories.bulkCreate(payload.projectId, payload.statusId, payload.stories);
        }).map((result) => {
            return new actions.AppendKanbanUserStoriesAction(result);
        });

    constructor(private actions$: Actions,
                private rs: ResourcesService,
                private storage: StorageService,
                private filtersRemoteStorage: FiltersRemoteStorageService) { }
}
