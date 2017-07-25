import * as Immutable from "immutable";

import {Component, OnDestroy, OnInit} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/zip";
import { StartLoadingAction, StopLoadingAction, OpenLightboxAction } from "../../app.actions";
import { IState } from "../../app.store";
import { FetchCurrentProjectAction } from "../projects/projects.actions";
import { ZoomLevelService } from "../services/zoom-level.service";
import * as actions from "./backlog.actions";

@Component({
    template: require("./backlog.pug")(),
})
export class BacklogPage implements OnInit, OnDestroy {
    section = "backlog";
    showFilters: boolean = false;
    showTags: boolean = false;
    project: Observable<Immutable.Map<string, any>>;
    editingSprint: Observable<Immutable.Map<string, any>>;
    userstories: Observable<any[]>;
    zoom: Observable<any>;
    appliedFilters: Observable<any>;
    selectedFiltersCount: number = 0;
    filters: Observable<any>;
    members: Observable<any>;
    assignedOnAssignedTo: Observable<Immutable.List<number>>;
    subscriptions: Subscription[];
    bulkCreateState: Observable<number>;
    stats: Observable<Immutable.Map<string, any>>;
    sprints: Observable<Immutable.Map<string, any>>;

    constructor(private store: Store<IState>,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private zoomLevel: ZoomLevelService) {
        this.store.dispatch(new StartLoadingAction());
        this.project = this.store.select((state) => state.getIn(["projects", "current-project"]));
        this.editingSprint = this.store.select((state) => state.getIn(["backlog", "editing-sprint"]));
        this.members = this.store.select((state) => state.getIn(["projects", "current-project", "members"]));
        this.stats = this.store.select((state) => state.getIn(["backlog", "stats"]));
        this.sprints = this.store.select((state) => state.getIn(["backlog", "sprints"]));
        this.userstories = this.store.select((state) => state.getIn(["backlog", "userstories"]))
                                     .filter((uss) => uss !== null)
                                     .do(() => this.store.dispatch(new StopLoadingAction()));
        this.zoom = this.store.select((state) => state.getIn(["backlog", "zoomLevel"])).map((level) => {
            return {
                level,
                visibility: this.zoomLevel.getVisibility("backlog", level),
            };
        });
        this.appliedFilters = this.store.select((state) => state.getIn([this.section, "appliedFilters"]));
        this.filters = this.store.select((state) => state.getIn(["backlog", "filtersData"]))
                                 .map(this.filtersDataToFilters.bind(this));
        this.assignedOnAssignedTo = this.store.select((state) => state.getIn(["backlog", "current-us", "assigned_to"]))
                                              .map((id) => Immutable.List(id));
        this.bulkCreateState = this.store.select((state) => state.getIn(["backlog", "bulk-create-state"]));
        this.stats = this.store.select((state) => state.getIn(["backlog", "stats"]));
    }

    ngOnInit() {
        this.subscriptions = [
            this.project.subscribe((project) => {
                if (project) {
                    this.store.dispatch(new actions.FetchBacklogAppliedFiltersAction(project.get("id")));
                    this.store.dispatch(new actions.FetchBacklogStatsAction(project.get("id")));
                    this.store.dispatch(new actions.FetchBacklogSprintsAction(project.get("id")));
                }
            }),
            Observable.combineLatest(this.project, this.appliedFilters).subscribe(([project, appliedFilters]: any[]) => {
                if (project && appliedFilters) {
                    this.store.dispatch(new actions.FetchBacklogFiltersDataAction(project.get("id"), appliedFilters));
                    this.store.dispatch(new actions.FetchBacklogUserStoriesAction(project.get("id"), appliedFilters));
                }
            }),
        ];
    }

    addFilter({category, filter}) {
        this.store.dispatch(new actions.AddBacklogFilter(category.get("dataType"), filter.get("id")));
    }

    removeFilter({category, filter}) {
        this.store.dispatch(new actions.RemoveBacklogFilter(category.get("dataType"), filter.get("id")));
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
        this.store.dispatch(new actions.CleanBacklogDataAction());
    }

    loadClosedSprints(projectId) {
        this.store.dispatch(new actions.FetchBacklogClosedSprintsAction(projectId));
    }

    addNewUs() {
        this.store.dispatch(new OpenLightboxAction("backlog.new-us"));
    }

    addNewUsBulk() {
        this.store.dispatch(new OpenLightboxAction("backlog.new-us-bulk"));
    }

    addNewSprint() {
        this.store.dispatch(new OpenLightboxAction("backlog.sprint-add-edit"));
    }

    editSprint(sprint) {
        console.log("EDITSPRINT_FUNCTION");
        this.store.dispatch(new actions.SetEditingSprintAction(sprint));
        this.store.dispatch(new OpenLightboxAction("backlog.sprint-add-edit"));
    }

    getJoyrideSteps() {
        return Immutable.fromJS([
            {
                element: ".summary",
                position: "bottom",
                joyride: {
                    title: "JOYRIDE.BACKLOG.STEP1.TITLE",
                    text: [
                        "JOYRIDE.BACKLOG.STEP1.TEXT1",
                        "JOYRIDE.BACKLOG.STEP1.TEXT2",
                    ],
                },
            },
            {
                element: ".backlog-table-empty",
                position: "bottom",
                joyride: {
                    title: "JOYRIDE.BACKLOG.STEP2.TITLE",
                    text: "JOYRIDE.BACKLOG.STEP2.TEXT",
                },
            },
            {
                element: ".sprints",
                position: "left",
                joyride: {
                    title: "JOYRIDE.BACKLOG.STEP3.TITLE",
                    text: "JOYRIDE.BACKLOG.STEP3.TEXT",
                },
            },
            // if (this.checkPermissionsService.check("add_us")) {
            {
                element: ".new-us",
                position: "rigth",
                joyride: {
                    title: "JOYRIDE.BACKLOG.STEP4.TITLE",
                    text: "JOYRIDE.BACKLOG.STEP4.TEXT",
                },
            }
        ]);
    }
}
