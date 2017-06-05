import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { CheckPermissionsService} from "./check-permissions.service";

@Directive({selector: '[tgIfPerm]'})
export class IfPermDirective {
	private hasView = false;

    constructor(private templateRef: TemplateRef<any>,
				private viewContainer: ViewContainerRef,
				private checkPermissions: CheckPermissionsService) { }

	@Input() set tgIfPerm(perm: boolean) {
		let condition = this.checkPermissions.check(perm);
	    if (condition && !this.hasView) {
	      this.viewContainer.createEmbeddedView(this.templateRef);
	      this.hasView = true;
	    } else if (!condition && this.hasView) {
	      this.viewContainer.clear();
	      this.hasView = false;
	    }
	}
}
