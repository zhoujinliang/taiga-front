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
import * as actions from "./team.actions";

@Injectable()
export class TeamEffects {
    @Effect()
    fetchTeamStats$: Observable<Action> = this.actions$
        .ofType("FETCH_TEAM_STATS")
        .map(toPayload)
        .switchMap((projectId) => {
          return this.rs.projects.memberStats(projectId).map((result) => {
              return new actions.SetTeamStatsAction(result.data);
          });
        });

    constructor(private actions$: Actions, private rs: ResourcesService) { }
}
