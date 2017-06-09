import { Component, Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
    template: `<img class='loading-spinner' src='/${_version}/svg/spinner-circle.svg' alt='loading...' />`
})
export class LoadingAux {}

@Directive({selector: '[tgLoading]'})
export class LoadingDirective {
    constructor(private templateRef: TemplateRef<any>,
				private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver) {}

	@Input() set tgLoading(condition: boolean) {
	    if (!condition) {
            this.viewContainer.clear()
            this.viewContainer.createEmbeddedView(this.templateRef);
	    } else if (condition) {
            let loadingFactory = this.componentFactoryResolver.resolveComponentFactory(LoadingAux);
            this.viewContainer.clear()
            this.viewContainer.createComponent(loadingFactory)
	    }
	}
}
