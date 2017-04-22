import * as _ from "lodash"
import * as Immutable from "immutable"

import {Injectable} from "@angular/core"
import {downgradeInjectable} from "@angular/upgrade/static"
import {StorageService} from "./base/storage"
import {ModelService} from "./base/model"
import {HttpService} from "./base/http"
import {UrlsService} from "./base/urls"
import {ConfigurationService} from "./base/conf"
import {TranslateService} from "@ngx-translate/core"
import {CurrentUserService} from "../../modules/services/current-user.service"
import {ThemeService} from "../../modules/services/theme.service"
import {GlobalDataService} from "../../modules/services/global-data.service"

@Injectable()
export class AuthService {
    _currentTheme:any
    userData:any

    constructor(private globalData: GlobalDataService,
                private storage: StorageService,
                private model: ModelService,
                private http: HttpService,
                private urls: UrlsService,
                private config: ConfigurationService,
                private translate: TranslateService,
                private currentUser: CurrentUserService,
                private theme: ThemeService) {
        let userModel = this.getUser();
        this._currentTheme = this._getUserTheme();

        this.setUserdata(userModel);
    }

    setUserdata(userModel) {
        if (userModel) {
            this.userData = Immutable.fromJS(userModel.getAttrs());
            return this.currentUser.setUser(this.userData);
        } else {
            return this.userData = null;
        }
    }

    _getUserTheme() {
        return (this.globalData.get('user') != null && this.globalData.get('user').theme) || this.config.get("defaultTheme") || "taiga"; // load on index.jade
    }

    _setTheme() {
        let newTheme = this._getUserTheme();

        if (this._currentTheme !== newTheme) {
            this._currentTheme = newTheme;
            return this.theme.use(this._currentTheme);
        }
    }

    _setLocales() {
        let lang = (this.globalData.get('user') != null && this.globalData.get('user').lang) || this.config.get("defaultLanguage") || "en";
        this.translate.setDefaultLang(lang);  // Needed for calls to the api in the correct language
        return this.translate.use(lang);                // Needed for change the interface in runtime
    }

    getUser() {
        if (this.globalData.get('user')) {
            return this.globalData.get('user');
        }

        let userData = this.storage.get("userInfo");

        if (userData) {
            let user = this.model.make_model("users", userData);
            this.globalData.set('user', user);
            this._setLocales();
            this._setTheme();
            return user;
        } else {
            this._setTheme();
        }

        return null;
    }

    setUser(user) {
        this.globalData.set('auth', user);
        this.storage.set("userInfo", user.getAttrs());
        this.globalData.set('user', user);

        this.setUserdata(user);

        this._setLocales();
        return this._setTheme();
    }

    clear() {
        this.globalData.unset('auth');
        this.globalData.unset('user');
        return this.storage.remove("userInfo");
    }

    setToken(token) {
        return this.storage.set("token", token);
    }

    getToken() {
        return this.storage.get("token");
    }

    removeToken() {
        return this.storage.remove("token");
    }

    isAuthenticated() {
        if (this.getUser() !== null) {
            return true;
        }
        return false;
    }

    //# Http interface
    refresh() {
        let url = this.urls.resolve("user-me");

        return this.http.get(url).subscribe((data:any) => {
            let user = data.data;
            user.token = this.getUser().auth_token;

            user = this.model.make_model("users", user);

            this.setUser(user);
            return user;
        });
    }

    login(data, type) {
        let url = this.urls.resolve("auth");

        data = _.clone(data);
        data.type = type ? type : "normal";

        this.removeToken();

        return this.http.post(url, data).subscribe((data:any) => {
            let user = this.model.make_model("users", data.data);
            this.setToken((<any>user).auth_token);
            this.setUser(user);
            return user;
        });
    }

    logout() {
        this.removeToken();
        this.clear();
        this.currentUser.removeUser();

        this._setTheme();
        return this._setLocales();
    }


    register(data, type, existing) {
        let url = this.urls.resolve("auth-register");

        data = _.clone(data);
        data.type = type ? type : "public";
        if (type === "private") {
            data.existing = existing ? existing : false;
        }

        this.removeToken();

        return this.http.post(url, data).subscribe((response:any) => {
            let user = this.model.make_model("users", response.data);
            this.setToken((<any>user).auth_token);
            this.setUser(user);
            return user;
        });
    }

    acceptInvitiationWithNewUser(data) {
        return this.register(data, "private", false);
    }

    forgotPassword(data) {
        let url = this.urls.resolve("users-password-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changePasswordFromRecovery(data) {
        let url = this.urls.resolve("users-change-password-from-recovery");
        data = _.clone(data);
        this.removeToken();
        return this.http.post(url, data);
    }

    changeEmail(data) {
        let url = this.urls.resolve("users-change-email");
        data = _.clone(data);
        return this.http.post(url, data);
    }

    cancelAccount(data) {
        let url = this.urls.resolve("users-cancel-account");
        data = _.clone(data);
        return this.http.post(url, data);
    }
}


