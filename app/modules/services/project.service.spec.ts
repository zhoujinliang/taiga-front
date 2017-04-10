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
 * File: project.service.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
declare var sinon:any;

describe("tgProjectService", function() {
    let $provide = null;
    let $interval = null;
    let mocks:any = {};
    let projectService = null;

    let _mockProjectsService = function() {
        mocks.projectsService = {
            getProjectBySlug: sinon.stub()
        };

        return $provide.value("tgProjectsService", mocks.projectsService);
    };

    let _mockUserActivityService = function() {
        mocks.userActivityService = {
            onInactive: sinon.stub(),
            onActive: sinon.stub()
        };

        return $provide.value("tgUserActivityService", mocks.userActivityService);
    };

    let _mockXhrErrorService = function() {
        mocks.xhrErrorService = {
            response: sinon.stub()
        };

        return $provide.value("tgXhrErrorService", mocks.xhrErrorService);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockProjectsService();
            _mockXhrErrorService();
            _mockUserActivityService();

            return null;
        })
    ;

    let _setup = () => _mocks();

    let _inject = () =>
        inject(function(_tgProjectService_, _$interval_) {
            projectService = _tgProjectService_;
            return $interval = _$interval_;
        })
    ;

    beforeEach(function() {
        module("taigaCommon");

        _setup();
        return _inject();
    });

    it("update section and add it at the begginning of section breadcrumb", function() {
        let section = "fakeSection";
        let breadcrumb = ["fakeSection"];

        projectService.setSection(section);

        expect(projectService.section).to.be.equal(section);
        expect(projectService.sectionsBreadcrumb.toJS()).to.be.eql(breadcrumb);

        section = "fakeSection222";
        breadcrumb = ["fakeSection", "fakeSection222"];
        projectService.setSection(section);

        return expect(projectService.sectionsBreadcrumb.toJS()).to.be.eql(breadcrumb);
    });

    it("set project if the project slug has changed", function(done) {
        projectService.setProject = sinon.spy();

        let project = Immutable.Map({
            id: 1,
            slug: 'slug-1',
            members: []
        });

        mocks.projectsService.getProjectBySlug.withArgs('slug-1').promise().resolve(project);
        mocks.projectsService.getProjectBySlug.withArgs('slug-2').promise().resolve(project);

        return projectService.setProjectBySlug('slug-1')
            .then(() => projectService.setProjectBySlug('slug-1'))
            .then(() => projectService.setProjectBySlug('slug-2'))
            .finally(function() {
                expect(projectService.setProject).to.be.called.twice;
                return done();
        });
    });

    it("set project and set active members", function() {
        let project = Immutable.fromJS({
            name: 'test project',
            members: [
                {is_active: true},
                {is_active: false},
                {is_active: true},
                {is_active: false},
                {is_active: false}
            ]
        });

        projectService.setProject(project);

        expect(projectService.project).to.be.equal(project);
        return expect(projectService.activeMembers.size).to.be.equal(2);
    });

    it("fetch project", function(done) {
        let project = Immutable.Map({
            id: 1,
            slug: 'slug',
            members: []
        });

        projectService._project = project;

        mocks.projectsService.getProjectBySlug.withArgs(project.get('slug')).promise().resolve(project);

        return projectService.fetchProject().then(function() {
            expect(projectService.project).to.be.equal(project);
            return done();
        });
    });

    it("clean project", function() {
        projectService._section = "fakeSection";
        projectService._sectionsBreadcrumb = ["fakeSection"];
        projectService._activeMembers = ["fakeMember"];
        projectService._project = Immutable.Map({
            id: 1,
            slug: 'slug',
            members: []
        });

        projectService.cleanProject();

        expect(projectService.project).to.be.null;
        expect(projectService.activeMembers.size).to.be.equal(0);
        expect(projectService.section).to.be.null;
        return expect(projectService.sectionsBreadcrumb.size).to.be.equal(0);
    });

    it("has permissions", function() {
        let project = Immutable.Map({
            id: 1,
            my_permissions: [
                'test1',
                'test2'
            ]
        });

        projectService._project = project;

        let perm1 = projectService.hasPermission('test2');
        let perm2 = projectService.hasPermission('test3');

        expect(perm1).to.be.true;
        return expect(perm2).to.be.false;
    });

    it("autorefresh project interval", function() {
        projectService.fetchProject = sinon.spy();

        expect(projectService.fetchProject).not.to.have.been.called;

        $interval.flush(60 * 11 * 1000);

        return expect(projectService.fetchProject).to.have.been.called;
    });

    it("cancel interval on user inactivity", function() {
        $interval.cancel = sinon.spy();

        projectService.fetchProject = sinon.spy();

        expect($interval.cancel).not.to.have.been.called;

        mocks.userActivityService.onInactive.callArg(0);

        return expect($interval.cancel).to.have.been.called;
    });

    return it("fech project if the user restars the activity", function() {
        projectService.fetchProject = sinon.spy();
        projectService.autoRefresh = sinon.spy();

        expect(projectService.fetchProject).not.to.have.been.called;
        expect(projectService.autoRefresh).not.to.have.been.called;

        mocks.userActivityService.onActive.callArg(0);

        expect(projectService.fetchProject).to.have.been.called;
        return expect(projectService.autoRefresh).to.have.been.called;
    });
});
