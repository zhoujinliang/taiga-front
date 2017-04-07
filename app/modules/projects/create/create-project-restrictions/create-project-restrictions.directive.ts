let module = angular.module("taigaProject");

let createProjectRestrictionsDirective = () =>
    ({
        scope: {
            isPrivate: '=',
            canCreatePrivateProjects: '=',
            canCreatePublicProjects: '='
        },
        templateUrl: "projects/create/create-project-restrictions/create-project-restrictions.html"
    })
;

module.directive('tgCreateProjectRestrictions', [createProjectRestrictionsDirective]);
