import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { IState } from "./app.store";
import { LogoutAction, RestoreUserAction } from "./modules/auth/auth.actions";
import { OpenLightboxAction, SendFeedbackAction } from "./app.actions";
import { FetchCurrentProjectAction, FetchUserProjectsAction } from "./modules/projects/projects.actions";
import { Subscription } from "rxjs";

@Component({
  selector: "tg-view",
  template: require("./app.pug")(),
})
export class AppComponent {
    user: any;
    projects: any;
    errorHandling: any = {};
    currentProject: string = "";
    subscriptions: Subscription[];

    constructor(private store: Store<IState>,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private translate: TranslateService) {
        this.user = this.store.select((state) => state.getIn(["auth", "user"]));
        this.projects = this.store.select((state) => state.getIn(["projects", "user-projects"]));
        this.store.dispatch(new RestoreUserAction());
        this.translate.use("en");

        this.subscriptions = [
            // Fetch current project based on the URL
            this.store.select((state) => state.getIn(['router', 'path'])).subscribe((path) => {
                if (!path) { return }
                const splitted_path = path.split("/");

                if (splitted_path.length < 3) { return }
                console.log(splitted_path);
                if (splitted_path[1] !== "project") { return }

                const slug = splitted_path[2];
                if (slug !== this.currentProject) {
                    this.currentProject = slug;
                    this.store.dispatch(new FetchCurrentProjectAction(slug));
                }
            }),
            this.user.subscribe((user) => {
                if (user) {
                    this.store.dispatch(new FetchUserProjectsAction(user.get("id")));
                }
            }),
        ]
    }

    onLogout() {
        this.store.dispatch(new LogoutAction());
    }

    onFeedback() {
        this.store.dispatch(new OpenLightboxAction("feedback"));
    }

    onFeedbackFilled(feedback) {
        this.store.dispatch(new SendFeedbackAction(feedback));
    }

    onLogin() {
        return this.router.navigate(["/login"], { queryParams: { next: this.router.url }});
    }
}
