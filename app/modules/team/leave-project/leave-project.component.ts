@Component({
    selector: "tg-leave-project",
    template: require("./leave-project.pug")(),
})
export class LeaveProject {
    @Input() user: Immutable.Map<string, any>;
    @Input() project: Immutable.Map<string, any>;

    // TODO
    // const link = function($scope, $el, $attrs) {
    //     const leaveConfirm = function() {
    //         const leave_project_text = $translate.instant("TEAM.ACTION_LEAVE_PROJECT");
    //         const confirm_leave_project_text = $translate.instant("TEAM.CONFIRM_LEAVE_PROJECT");
    //
    //         return $confirm.ask(leave_project_text, confirm_leave_project_text).then((response) => {
    //             const promise = $rs.projects.leave($scope.project.id);
    //
    //             promise.then(() => {
    //                 return currentUserService.loadProjects().then(function() {
    //                     response.finish();
    //                     $confirm.notify("success");
    //                     return $location.path($navurls.resolve("home"));
    //                 });
    //             });
    //
    //             return promise.then(null, function(response) {
    //                 response.finish();
    //                 return $confirm.notify("error", response.data._error_message);
    //             });
    //         });
    //     };
    //
    //     return $scope.leave = function() {
    //         if ($scope.project.owner.id === $scope.user.id) {
    //             return lightboxFactory.create("tg-lightbox-leave-project-warning", {
    //                 class: "lightbox lightbox-leave-project-warning",
    //             }, {
    //                 isCurrentUser: true,
    //                 project: $scope.project,
    //             });
    //         } else {
    //             return leaveConfirm();
    //         }
    //     };
    // };
}
