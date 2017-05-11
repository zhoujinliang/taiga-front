import {Observable} from "rxjs";
import {AddNotificationMessageAction} from "../../ts/modules/common/common.actions";

export function genericErrorManagement(err) {
    return Observable.of(new AddNotificationMessageAction("error", err.data.get('_error_message')));
}

export function genericSuccessManagement() {
    return new AddNotificationMessageAction("success");
}
