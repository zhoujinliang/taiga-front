import * as Immutable from "immutable";

import {Component, OnInit, OnDestroy} from "@angular/core";
import { IState } from "../../app.store";
import { Store } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import * as actions from "./kanban.actions";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import { ZoomLevelService } from "../services/zoom-level.service";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";

@Component({
    template: require('./kanban.jade')()
})
export class KanbanPage implements OnInit, OnDestroy {
    section = "kanban";
    project: Observable<any>;
    userstoriesByState: Observable<any[]>;
    zoom: Observable<any>;
    appliedFilters: Observable<any>;
    selectedFiltersCount: number = 0;
    filters: Observable<any>;
    filtersOpen:boolean = false;
    subscriptions: Subscription[]

    constructor(private store: Store<IState>, private route: ActivatedRoute, private translate: TranslateService, private zoomLevel: ZoomLevelService) {
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]))
        this.userstoriesByState = this.store.select((state) => state.getIn(["kanban", "userstories"])).map((userstories) => {
            return userstories.groupBy((us) => us.get('status').toString())
        })
        this.zoom = this.store.select((state) => state.getIn(["kanban", "zoomLevel"])).map((zoomLevel) => {
            return {
                level: zoomLevel,
                visibility: this.zoomLevel.getVisibility("kanban", zoomLevel),
            }
        });
        this.appliedFilters = this.store.select((state) => state.getIn([this.section, "appliedFilters"]))
        this.filters = this.store.select((state) => state.getIn(["kanban", "filtersData"])).map(this.filtersDataToFilters.bind(this));
    }

    ngOnInit() {
        this.subscriptions = [
            this.route.params.subscribe((params) => {
                this.store.dispatch(new FetchCurrentProjectAction(params.slug));
            }),
            this.project.subscribe((project) => {
                if (project) {
                    this.store.dispatch(new actions.FetchKanbanAppliedFiltersAction(project.get('id')));
                }
            }),
            Observable.zip(this.project, this.appliedFilters).subscribe(([project, appliedFilters]:any[]) => {
                if (project && appliedFilters) {
                    this.store.dispatch(new actions.FetchKanbanFiltersDataAction(project.get('id'), appliedFilters));
                    this.store.dispatch(new actions.FetchKanbanUserStoriesAction(project.get('id'), appliedFilters));
                }
            })
        ]
    }

    toggleFiltersOpen() {
        this.filtersOpen = !this.filtersOpen;
    }

    addFilter({category, filter}) {
        this.store.dispatch(new actions.AddKanbanFilter(category.get('dataType'), filter.get('id')));
    }

    removeFilter({category, filter}) {
        this.store.dispatch(new actions.RemoveKanbanFilter(category.get('dataType'), filter.get('id')));
    }

    filtersDataToFilters(filtersData) {
        if (filtersData === null) {
            return null;
        }
        let statuses = filtersData.get('statuses')
                                  .map((status) => status.update('id', (id) => id.toString()));

        let tags = filtersData.get('tags')
                              .map((tag) => tag.update('id', () => tag.get('name')));
        let tagsWithAtLeastOneElement = tags.filter((tag) => tag.count > 0);

        let assignedTo = filtersData.get('assigned_to').map((assigned_to) => {
            return assigned_to.update("id", (id) => id ? id.toString(): "null")
                              .update("name", () => assigned_to.get('full_name') || "Undefined");
        })

        let owners = filtersData.get('owners').map((owner) => {
            return owner.update("id", (id) => id.toString())
                        .update("name", () => owner.get('full_name'));
        });

        let epics = filtersData.get('epics').map((epic) => {
            if (epic.get('id')) {
                return epic.update("id", (id) => id.toString())
                           .update("name", () => `#${epic.get('ref')} ${epic.get('subject')}`);
            }
            return epic.update("id", (id) => "null")
                       .update("name", () => "Not in an epic"); // TODO TRANSLATE IT?
        })

        let filters = Immutable.List();
        filters = filters.push(Immutable.Map({
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.STATUS"),
            dataType: "status",
            content: statuses
        }));
        filters = filters.push(Immutable.Map({
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.TAGS"),
            dataType: "tags",
            content: tags,
            hideEmpty: true,
            totalTaggedElements: tagsWithAtLeastOneElement.size
        }));
        filters = filters.push(Immutable.Map({
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.ASSIGNED_TO"),
            dataType: "assigned_to",
            content: assignedTo
        }));
        filters = filters.push(Immutable.Map({
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.CREATED_BY"),
            dataType: "owner",
            content: owners
        }));
        filters = filters.push(Immutable.Map({
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.EPIC"),
            dataType: "epic",
            content: epics
        }));
        return filters;
    }

    ngOnDestroy() {
        for (let subs of this.subscriptions) {
            subs.unsubscribe();
        }
    }
}
