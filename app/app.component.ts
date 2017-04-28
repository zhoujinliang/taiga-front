import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { IState } from "./app.store";
import { LogoutAction, RestoreUserAction } from "./modules/auth/auth.actions";
import { FetchUserProjectsAction } from "./modules/projects/projects.actions";

@Component({
  selector: "tg-view",
  template: require("./app.jade")(),
})
export class AppComponent {
    user: any;
    projects: any;
    errorHandling: any = {};

    constructor(private store: Store<IState>,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private translate: TranslateService) {
        this.user = this.store.select((state) => state.getIn(["auth", "user"]));
        this.projects = this.store.select((state) => state.getIn(["projects", "user-projects"]));
        this.store.dispatch(new RestoreUserAction());
        this.translate.use("en");
        this.user.subscribe((user) => {
            if (user) {
                this.store.dispatch(new FetchUserProjectsAction(user.get("id")));
            }
        });
    }

    onLogout() {
        this.store.dispatch(new LogoutAction());
    }

    onLogin() {
        return this.router.navigate(["/login"], { queryParams: { next: this.router.url }});
    }
}
