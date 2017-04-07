/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: project-menu.controller.spec.coffee
 */

describe("ProjectMenu", function() {
    let $provide = null;
    let $controller = null;
    let mocks = {};

    let _mockProjectService = function() {
        mocks.projectService = {};

        return $provide.value("tgProjectService", mocks.projectService);
    };

    let _mockLightboxFactory = function() {
        mocks.lightboxFactory = {
            create: sinon.spy()
        };

        return $provide.value("tgLightboxFactory", mocks.lightboxFactory);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockProjectService();
            _mockLightboxFactory();

            return null;
        })
    ;

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("open search lightbox", function() {
        let ctrl = $controller("ProjectMenu");
        ctrl.search();

        let expectation = mocks.lightboxFactory.create.calledWithExactly("tg-search-box", {
            "class": "lightbox lightbox-search"
        });

        return expect(expectation).to.be.true;
    });

    return describe("show menu", function() {
        it("project filled", function() {
            let project = Immutable.fromJS({});

            mocks.projectService.project = project;
            mocks.projectService.sectionsBreadcrumb = Immutable.List();

            let ctrl = $controller("ProjectMenu");

            ctrl.show();

            return expect(ctrl.project).to.be.equal(project);
        });

        it("videoconference url", function() {
            let project = Immutable.fromJS({
                "videoconferences": "appear-in",
                "videoconferences_extra_data": "123",
                "slug": "project-slug"
            });

            mocks.projectService.project = project;
            mocks.projectService.sectionsBreadcrumb = Immutable.List();

            let ctrl = $controller("ProjectMenu");

            ctrl.show();

            let url = "https://appear.in/project-slug-123";

            return expect(ctrl.project.get("videoconferenceUrl")).to.be.equal(url);
        });

        describe("menu permissions", function() {
            it("all options disable", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                let menu = ctrl.menu.toJS();

                return expect(menu).to.be.eql({
                    epics: false,
                    backlog: false,
                    kanban: false,
                    issues: false,
                    wiki: false
                });
            });

            it("all options enabled", function() {
                let project = Immutable.fromJS({
                    is_epics_activated: true,
                    is_backlog_activated: true,
                    is_kanban_activated: true,
                    is_issues_activated: true,
                    is_wiki_activated: true,
                    my_permissions: ["view_epics", "view_us", "view_issues", "view_wiki_pages"]
                });

                mocks.projectService.project = project;
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                let menu = ctrl.menu.toJS();

                return expect(menu).to.be.eql({
                    epics: true,
                    backlog: true,
                    kanban: true,
                    issues: true,
                    wiki: true
                });
            });

            return it("all options disabled because the user doesn't have permissions", function() {
                let project = Immutable.fromJS({
                    is_epics_activated: true,
                    is_backlog_activated: true,
                    is_kanban_activated: true,
                    is_issues_activated: true,
                    is_wiki_activated: true,
                    my_permissions: []
                });

                mocks.projectService.project = project;
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                let menu = ctrl.menu.toJS();

                return expect(menu).to.be.eql({
                    epics: false,
                    backlog: false,
                    kanban: false,
                    issues: false,
                    wiki: false
                });
            });
        });

        return describe("menu active", function() {
            it("backlog", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog";
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("backlog");
            });

            it("backlog-kanban without parent", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("backlog-kanban");
            });

            it("backlog-kanban when only kanban is enabled", function() {
                let project = Immutable.fromJS({
                    is_kanban_activated: true,
                    my_permissions: []
                });

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("kanban");
            });

            it("backlog-kanban when only backlog is enabled", function() {
                let project = Immutable.fromJS({
                    is_backlog_activated: true,
                    my_permissions: []
                });

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List();

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("backlog");
            });

            it("backlog-kanban when is child of kanban", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List.of("oo", "backlog", "kanban");

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("kanban");
            });

            it("backlog-kanban when is child of backlog", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List.of("kanban", "oo", "backlog");

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("backlog");
            });


            return it("backlog-kanban when kanban is not in the breadcrumb", function() {
                let project = Immutable.fromJS({});

                mocks.projectService.project = project;
                mocks.projectService.section = "backlog-kanban";
                mocks.projectService.sectionsBreadcrumb = Immutable.List.of("oo", "backlog");

                let ctrl = $controller("ProjectMenu");

                ctrl.show();

                return expect(ctrl.active).to.be.equal("backlog");
            });
        });
    });
});
