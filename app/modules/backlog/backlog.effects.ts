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
import * as actions from "./backlog.actions";

@Injectable()
export class BacklogEffects {
    @Effect()
    fetchBacklogUserStories$: Observable<Action> = this.actions$
        .ofType("FETCH_BACKLOG_USER_STORIES")
        .map(toPayload)
        .switchMap((payload) => {
          const params = payload.appliedFilters.toJS();
          return this.rs.userstories.listAll(payload.projectId, params).map((userstories) => {
              return new actions.SetBacklogUserStoriesAction(userstories.data);
          });
        });

    @Effect()
    fetchBacklogFiltersData$: Observable<Action> = this.actions$
        .ofType("FETCH_BACKLOG_FILTERS_DATA")
        .map(toPayload)
        .switchMap((payload) => {
          const data = _.extend({project: payload.projectId}, payload.appliedFilters.toJS());
          return this.rs.userstories.filtersData(data).map((filtersData) => {
              return new actions.SetBacklogFiltersDataAction(filtersData);
          });
        });

    @Effect()
    fetchBacklogAppliedFilters$: Observable<Action> = this.actions$
        .ofType("FETCH_BACKLOG_APPLIED_FILTERS")
        .map(toPayload)
        .switchMap((projectId) => {

          return this.filtersRemoteStorage.getFilters(projectId, "backlog").map((filtersData) => {
              return new actions.SetBacklogAppliedFiltersAction(filtersData);
          });
        });

    @Effect()
    fetchBacklogStats$: Observable<Action> = this.actions$
        .ofType("FETCH_BACKLOG_STATS")
        .map(toPayload)
        .switchMap((projectId) => {
          return this.rs.projects.stats(projectId).map((stats) => {
              return new actions.SetBacklogStatsAction(stats.data);
          });
        });

    @Effect()
    fetchBacklogSprints$: Observable<Action> = this.actions$
        .ofType("FETCH_BACKLOG_SPRINTS")
        .map(toPayload)
        .switchMap((projectId) => {
          return this.rs.sprints.list(projectId).map((sprints) => {
              return new actions.SetBacklogSprintsAction(sprints.data);
          });
        });

    @Effect()
    changeBacklogZoom$: Observable<Action> = this.actions$
        .ofType("CHANGE_BACKLOG_ZOOM")
        .map(toPayload)
        .do((payload) => {
            this.storage.set("backlog_zoom", payload);
        }).map((payload) => {
            return new actions.SetBacklogZoom(payload);
        });

    @Effect()
    usBulkCreate$: Observable<Action> = this.actions$
        .ofType("US_BULK_CREATE")
        .map(toPayload)
        .switchMap((payload) => {
            return this.rs.userstories.bulkCreate(payload.projectId, payload.statusId, payload.stories);
        }).map((result) => {
            return new actions.AppendBacklogUserStoriesAction(result);
        });

    constructor(private actions$: Actions,
                private rs: ResourcesService,
                private storage: StorageService,
                private filtersRemoteStorage: FiltersRemoteStorageService) { }
}
