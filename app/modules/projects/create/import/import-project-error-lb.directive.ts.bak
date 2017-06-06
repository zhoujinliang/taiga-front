export let LbImportErrorDirective = function(lightboxService) {
    const link = function(scope, el, attrs) {
        lightboxService.open(el);

        return scope.close = function() {
            lightboxService.close(el);
        };
    };

    return {
        templateUrl: "projects/create/import/import-project-error-lb.html",
        link,
    };
};
LbImportErrorDirective.$inject = ["lightboxService"];
