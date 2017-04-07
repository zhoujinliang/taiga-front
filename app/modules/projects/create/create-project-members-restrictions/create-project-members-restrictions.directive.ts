let module = angular.module("taigaProject");

let createProjectMembersRestrictionsDirective = () =>
    ({
        scope: {
            isPrivate: '=',
            limitMembersPrivateProject: '=',
            limitMembersPublicProject: '='
        },
        templateUrl: "projects/create/create-project-members-restrictions/create-project-members-restrictions.html"
    })
;

module.directive('tgCreateProjectMembersRestrictions', [createProjectMembersRestrictionsDirective]);
