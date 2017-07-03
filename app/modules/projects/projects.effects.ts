import { Injectable } from "@angular/core";
import { Actions, Effect, toPayload } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import * as Immutable from "immutable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import { ResourcesService } from "../resources/resources.service";
import * as actions from "./projects.actions";
import { SetUserProjectsAction } from "./projects.actions";

@Injectable()
export class CurrentProjectsEffects {
    @Effect()
    fetchCurrentProject$: Observable<Action> = this.actions$
        .ofType("FETCH_CURRENT_PROJECT")
        .map(toPayload)
        .switchMap((projectSlug) => {
          return this.rs.projects.getProjectBySlug(projectSlug)
              .map((project) => new actions.SetCurrentProjectAction(Immutable.fromJS(project)));
        });

    @Effect()
    fetchUserProjects$: Observable<Action> = this.actions$
        .ofType("FETCH_USER_PROJECTS")
        .map(toPayload)
        .switchMap((userId) => this.rs.projects.getProjectsByUserId(userId))
        .map((projects) => new SetUserProjectsAction(projects));

    @Effect()
    fetchProjectTimeline$: Observable<Action> = this.actions$
        .ofType("FETCH_PROJECT_TIMELINE")
        .map(toPayload)
        .switchMap((payload) => {
          return this.rs.projects.getTimeline(payload.projectId, payload.page)
              .map((response:any) => new actions.AppendProjectTimelineAction(
                  response.data,
                  parseInt(response.headers.get('x-pagination-current'), 10),
                  response.headers.get('x-pagination-next') != null
              ));
        });

    @Effect()
    projectsChangeOrder$: Observable<Action> = this.actions$
        .ofType("PROJECTS_CHANGE_ORDER")
        .map(toPayload)
        .switchMap((payload) => {
          return this.rs.projects.bulkUpdateOrder(payload);
        });

    constructor(private actions$: Actions, private rs: ResourcesService) { }
}
