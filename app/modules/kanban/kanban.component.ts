import * as Immutable from "immutable";

import {Component, OnDestroy, OnInit} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import { StartLoadingAction, StopLoadingAction } from "../../app.actions";
import { IState } from "../../app.store";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import { ZoomLevelService } from "../services/zoom-level.service";
import * as actions from "./kanban.actions";

@Component({
    template: require("./kanban.pug")(),
})
export class KanbanPage implements OnInit, OnDestroy {
    section = "kanban";
    project: Observable<any>;
    userstoriesByState: Observable<any[]>;
    zoom: Observable<any>;
    appliedFilters: Observable<any>;
    selectedFiltersCount: number = 0;
    filters: Observable<any>;
    members: Observable<any>;
    assignedOnAssignedTo: Observable<Immutable.List<number>>;
    filtersOpen: boolean = false;
    subscriptions: Subscription[];
    bulkCreateState: Observable<number>;

    constructor(private store: Store<IState>,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private zoomLevel: ZoomLevelService) {
        this.store.dispatch(new StartLoadingAction());
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.members = this.store.select((state) => state.getIn(["projects", "current-project", "members"]));
        this.userstoriesByState = this.store.select((state) => state.getIn(["kanban", "userstories"]))
                                            .filter((uss) => uss !== null)
                                            .do(() => this.store.dispatch(new StopLoadingAction()))
                                            .map((userstories) => {
                                                return userstories.groupBy((us) => us.get("status").toString());
                                            })
        this.zoom = this.store.select((state) => state.getIn(["kanban", "zoomLevel"])).map((level) => {
            return {
                level,
                visibility: this.zoomLevel.getVisibility("kanban", level),
            };
        });
        this.appliedFilters = this.store.select((state) => state.getIn([this.section, "appliedFilters"]));
        this.filters = this.store.select((state) => state.getIn(["kanban", "filtersData"]))
                                 .map(this.filtersDataToFilters.bind(this));
        this.assignedOnAssignedTo = this.store.select((state) => state.getIn(["kanban", "current-us", "assigned_to"]))
                                              .map((id) => Immutable.List(id));
        this.bulkCreateState = this.store.select((state) => state.getIn(["kanban", "bulk-create-state"]));
    }

    ngOnInit() {
        this.subscriptions = [
            this.project.subscribe((project) => {
                if (project) {
                    this.store.dispatch(new actions.FetchKanbanAppliedFiltersAction(project.get("id")));
                }
            }),
            Observable.combineLatest(this.project, this.appliedFilters).subscribe(([project, appliedFilters]: any[]) => {
                if (project && appliedFilters) {
                    this.store.dispatch(new actions.FetchKanbanFiltersDataAction(project.get("id"), appliedFilters));
                    this.store.dispatch(new actions.FetchKanbanUserStoriesAction(project.get("id"), appliedFilters));
                }
            }),
        ];
    }

    toggleFiltersOpen() {
        this.filtersOpen = !this.filtersOpen;
    }

    addFilter({category, filter}) {
        this.store.dispatch(new actions.AddKanbanFilter(category.get("dataType"), filter.get("id")));
    }

    removeFilter({category, filter}) {
        this.store.dispatch(new actions.RemoveKanbanFilter(category.get("dataType"), filter.get("id")));
    }

    filtersDataToFilters(filtersData) {
        if (filtersData === null) {
            return null;
        }
        const statuses = filtersData.get("statuses")
                                  .map((status) => status.update("id", (id) => id.toString()));

        const tags = filtersData.get("tags")
                              .map((tag) => tag.update("id", () => tag.get("name")));
        const tagsWithAtLeastOneElement = tags.filter((tag) => tag.count > 0);

        const assignedTo = filtersData.get("assigned_to").map((user) => {
            return user.update("id", (id) => id ? id.toString() : "null")
                       .update("name", () => user.get("full_name") || "Undefined");
        });

        const owners = filtersData.get("owners").map((owner) => {
            return owner.update("id", (id) => id.toString())
                        .update("name", () => owner.get("full_name"));
        });

        const epics = filtersData.get("epics").map((epic) => {
            if (epic.get("id")) {
                return epic.update("id", (id) => id.toString())
                           .update("name", () => `#${epic.get("ref")} ${epic.get("subject")}`);
            }
            return epic.update("id", (id) => "null")
                       .update("name", () => "Not in an epic"); // TODO TRANSLATE IT?
        });

        let filters = Immutable.List();
        filters = filters.push(Immutable.Map({
            content: statuses,
            dataType: "status",
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.STATUS"),
        }));
        filters = filters.push(Immutable.Map({
            content: tags,
            dataType: "tags",
            hideEmpty: true,
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.TAGS"),
            totalTaggedElements: tagsWithAtLeastOneElement.size,
        }));
        filters = filters.push(Immutable.Map({
            content: assignedTo,
            dataType: "assigned_to",
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.ASSIGNED_TO"),
        }));
        filters = filters.push(Immutable.Map({
            content: owners,
            dataType: "owner",
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.CREATED_BY"),
        }));
        filters = filters.push(Immutable.Map({
            content: epics,
            dataType: "epic",
            title: this.translate.instant("COMMON.FILTERS.CATEGORIES.EPIC"),
        }));
        return filters;
    }

    onSorted(value) {
        console.log(value);
    }

    onBulkCreate(value) {
        this.store.dispatch(new actions.USBulkCreateAction(
            value.projectId,
            value.statusId,
            value.stories
        ));
    }

    ngOnDestroy() {
        for (const subs of this.subscriptions) {
            subs.unsubscribe();
        }
        this.store.dispatch(new actions.CleanKanbanDataAction());
    }

    getJoyrideSteps() {
        return Immutable.fromJS([
            {
                element: ".kanban-table-inner",
                position: "bottom",
                joyride: {
                    title: "JOYRIDE.KANBAN.STEP1.TITLE",
                    text: "JOYRIDE.KANBAN.STEP1.TEXT",
                },
            },
            {
                element: ".card-placeholder",
                position: "right",
                joyride: {
                    title: "JOYRIDE.KANBAN.STEP2.TITLE",
                    text: "JOYRIDE.KANBAN.STEP2.TEXT",
                },
            },
            //if (this.checkPermissionsService.check("add_us")) {
            {
                element: ".add-action",
                position: "bottom",
                joyride: {
                    title: "JOYRIDE.KANBAN.STEP3.TITLE",
                    text: [
                        "JOYRIDE.KANBAN.STEP3.TEXT1",
                        "JOYRIDE.KANBAN.STEP3.TEXT2",
                    ],
                },
            }
        ]);
    }
}
