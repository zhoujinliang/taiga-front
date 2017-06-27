import { Component, Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
    template: `<img class='loading-spinner big' src='/${_version}/svg/spinner-circle.svg' alt='loading...' />`
})
export class BigLoadingAux {}

@Component({
    template: `<img class='loading-spinner medium' src='/${_version}/svg/spinner-circle.svg' alt='loading...' />`
})
export class MediumLoadingAux {}

@Component({
    template: `<img class='loading-spinner small' src='/${_version}/svg/spinner-circle.svg' alt='loading...' />`
})
export class SmallLoadingAux {}

@Component({
    template: `<img class='loading-spinner small' src='/${_version}/svg/spinner-circle.svg' alt='loading...' />`
})
export class LoadingAux {}

@Directive({selector: '[tgLoading]'})
export class LoadingDirective {
    constructor(private templateRef: TemplateRef<any>,
				private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver) {}

    @Input() tgLoadingSize: string = "small";

	@Input() set tgLoading(condition: boolean) {
	    if (!condition) {
            this.viewContainer.clear()
            this.viewContainer.createEmbeddedView(this.templateRef);
	    } else if (condition) {
            let loadingFactory;
            if(this.tgLoadingSize === "big") {
                loadingFactory = this.componentFactoryResolver.resolveComponentFactory(BigLoadingAux);
            } else if(this.tgLoadingSize === "medium") {
                loadingFactory = this.componentFactoryResolver.resolveComponentFactory(MediumLoadingAux);
            } else if(this.tgLoadingSize === "small") {
                loadingFactory = this.componentFactoryResolver.resolveComponentFactory(SmallLoadingAux);
            } else {
                loadingFactory = this.componentFactoryResolver.resolveComponentFactory(SmallLoadingAux);
            }
            this.viewContainer.clear()
            let component = this.viewContainer.createComponent(loadingFactory)
	    }
	}
}
