let LbImportErrorDirective = function(lightboxService) {
    let link = function(scope, el, attrs) {
        lightboxService.open(el);

        return scope.close = function() {
            lightboxService.close(el);
        };
    };

    return {
        templateUrl: "projects/create/import/import-project-error-lb.html",
        link
    };
};

LbImportErrorDirective.$inject = ["lightboxService"];

angular.module("taigaProjects").directive("tgLbImportError", LbImportErrorDirective);
