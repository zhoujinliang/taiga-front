import * as _ from "lodash";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import * as actions from "./kanban.actions";
import * as Immutable from "immutable";
import { ResourcesService } from "../resources/resources.service";
import { StorageService} from "../../ts/modules/base/storage";

@Injectable()
export class KanbanEffects {
    @Effect()
    fetchKanbanUserStories$: Observable<Action> = this.actions$
        .ofType('FETCH_KANBAN_USER_STORIES')
        .map(toPayload)
        .switchMap(projectId => {
          return this.rs.userstories.listAll(projectId, {}).map((userstories) => {
              return new actions.SetKanbanUserStoriesAction(userstories)
          })
        });

    @Effect()
    changeKanbanZoom$: Observable<Action> = this.actions$
        .ofType('CHANGE_KANBAN_ZOOM')
        .map(toPayload)
        .do(payload => {
            this.storage.set('kanban_zoom', payload.level);
        }).map(payload => {
            return new actions.SetKanbanZoom(payload.level, payload.mpa);
        });
    //
    // @Effect()
    // fetchWatching$: Observable<Action> = this.actions$
    //     .ofType('FETCH_MOST_LIKED')
    //     .map(toPayload)
    //     .switchMap(period => {
    //       let orderBy = `-total_fans_${period}`
    //       return this.rs.projects.getProjects({discover_mode: true, order_by: orderBy}, false).map((result) => {
    //           let projects = Immutable.fromJS(result.data.slice(0, 5))
    //           return new actions.SetMostLikedAction(projects)
    //       })
    //     });
    //
    // @Effect()
    // fetchProjectsStats$: Observable<Action> = this.actions$
    //     .ofType('FETCH_PROJECTS_STATS')
    //     .map(toPayload)
    //     .switchMap(() => {
    //        return this.rs.stats.discover().map(stats => {
    //            return new actions.SetProjectsStatsAction(stats.getIn(["projects", "total"]))
    //        });
    //     });
    //
    // @Effect()
    // fetchFeaturedProjects$: Observable<Action> = this.actions$
    //     .ofType('FETCH_FEATURED_PROJECTS')
    //     .map(toPayload)
    //     .switchMap(() => {
    //        return this.rs.projects.getProjects({is_featured: true, discover_mode: true}, false)
    //            .map(result => {
    //                let data = result.data.slice(0, 4);
    //                let projects = Immutable.fromJS(data);
    //                return new actions.SetFeaturedProjectsAction(projects);
    //        });
    //     });
    //
    // @Effect()
    // searchDiscoverProjects$: Observable<Action> = this.actions$
    //     .ofType('SEARCH_DISCOVER_PROJECTS')
    //     .map(toPayload)
    //     .switchMap((payload) => {
    //        let params:any = { discover_mode: true };
    //
    //        if (payload.filter === 'people') {
    //            params.is_looking_for_people = true;
    //        } else if (payload.filter === 'scrum') {
    //            params.is_backlog_activated = true;
    //        } else if (payload.filter === 'kanban') {
    //            params.is_kanban_activated = true;
    //        }
    //        params.q = payload.q
    //        params.order_by = payload.orderBy
    //
    //        return this.rs.projects.getProjects(params)
    //           .flatMap(result => {
    //               let hasNextPage = !!result.headers['X-Pagination-Next'];
    //               let projects = Immutable.fromJS(result.data);
    //               return [
    //                   new actions.AppendDiscoverSearchResults(projects),
    //                   new actions.UpdateDiscoverSearchNextPage(hasNextPage)
    //               ]
    //           });
    //     });

    constructor(private actions$: Actions, private rs: ResourcesService, private storage: StorageService) { }
}
