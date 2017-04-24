import { Component } from '@angular/core';
import { Store } from "@ngrx/store";
import { IState } from "./app.store";
import { TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { RestoreUserAction, StoreUserAction } from "./modules/auth/auth.actions";

@Component({
  selector: 'tg-view',
  template: require("./app.jade")()
})
export class AppComponent {
    user:any
    projects:any
    errorHandling:any = {}

    constructor(private store: Store<IState>,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private translate: TranslateService) {
        this.user = this.store.select((state) => state.getIn(["global", "user"]))
        this.projects = this.store.select((state) => state.getIn(["global", "projects"]))
        this.store.dispatch(new RestoreUserAction())
        this.translate.use("en");
    }

    onLogout() {
        this.store.dispatch(new StoreUserAction({}));
        this.router.navigate(["/discover"]);
    }

    onLogin() {
        return this.router.navigate(["/login"], { queryParams: { next: this.router.url }});
    }
}
