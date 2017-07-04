import {Observable} from "rxjs";
import {AddNotificationMessageAction} from "../../ts/modules/common/common.actions";
import {StartLoadingItemAction, StopLoadingItemAction} from "../../app.actions";

export function genericErrorManagement(err) {
    return Observable.of(new AddNotificationMessageAction("error", err.data.get('_error_message')));
}

export function genericSuccessManagement() {
    return new AddNotificationMessageAction("success");
}

export function wrapLoading(loadingKey, func) {
    return (payload) => {
        return Observable.of(new StartLoadingItemAction(loadingKey)).concat(
            func(payload),
            Observable.of(new StopLoadingItemAction(loadingKey))
        );
    }
}
