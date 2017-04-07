/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: discover-search.controller.spec.coffee
 */

describe("DiscoverSearch", function() {
    let $provide = null;
    let $controller = null;
    let mocks = {};

    let _mockTranslate = function() {
        mocks.translate = {};
        mocks.translate.instant = sinon.stub();

        return $provide.value("$translate", mocks.translate);
    };

    let _mockAppMetaService = function() {
        mocks.appMetaService = {
            setAll: sinon.spy()
        };

        return $provide.value("tgAppMetaService", mocks.appMetaService);
    };

    let _mockRouteParams = function() {
        mocks.routeParams = {};

        return $provide.value("$routeParams", mocks.routeParams);
    };

    let _mockRoute = function() {
        mocks.route = {};

        return $provide.value("$route", mocks.route);
    };

    let _mockDiscoverProjects = function() {
        mocks.discoverProjects = {
            resetSearchList: sinon.spy(),
            fetchSearch: sinon.stub()
        };

        mocks.discoverProjects.fetchSearch.promise().resolve();

        return $provide.value("tgDiscoverProjectsService", mocks.discoverProjects);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockTranslate();
            _mockAppMetaService();
            _mockRoute();
            _mockRouteParams();
            _mockDiscoverProjects();

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
        module("taigaDiscover");

        return _setup();
    });

    it("initialize meta data", function() {
        mocks.translate.instant
            .withArgs('DISCOVER.SEARCH.PAGE_TITLE')
            .returns('meta-title');
        mocks.translate.instant
            .withArgs('DISCOVER.SEARCH.PAGE_DESCRIPTION')
            .returns('meta-description');

        let ctrl = $controller('DiscoverSearch');

        return expect(mocks.appMetaService.setAll.calledWithExactly("meta-title", "meta-description")).to.be.true;
    });

    it("initialize search params", function() {
        mocks.routeParams.text = 'text';
        mocks.routeParams.filter = 'filter';
        mocks.routeParams.order_by = 'order';

        let ctrl = $controller('DiscoverSearch');

        expect(ctrl.q).to.be.equal('text');
        expect(ctrl.filter).to.be.equal('filter');
        return expect(ctrl.orderBy).to.be.equal('order');
    });

    it("fetch", function() {
        let ctrl = $controller('DiscoverSearch');

        ctrl.search = sinon.spy();

        ctrl.fetch();

        expect(mocks.discoverProjects.resetSearchList).to.have.been.called;
        expect(ctrl.search).to.have.been.called;
        return expect(ctrl.page).to.be.equal(1);
    });

    it("showMore", function(done) {
        let ctrl = $controller('DiscoverSearch');

        ctrl.search = sinon.stub().promise();

        ctrl.showMore().then(function() {
            expect(ctrl.loadingPagination).to.be.false;

            return done();
        });

        expect(ctrl.loadingPagination).to.be.true;
        expect(ctrl.search).to.have.been.called;
        expect(ctrl.page).to.be.equal(2);

        return ctrl.search.resolve();
    });

    it("search", function() {
        mocks.discoverProjects.fetchSearch = sinon.stub();

        let filter = {
            filter: '123'
        };

        let ctrl = $controller('DiscoverSearch');

        ctrl.page = 1;
        ctrl.q = 'text';
        ctrl.orderBy = 1;

        ctrl.getFilter = () => filter;

        let params = {
            filter: '123',
            page: 1,
            q: 'text',
            order_by: 1
        };

        ctrl.search();

        return expect(mocks.discoverProjects.fetchSearch).have.been.calledWith(sinon.match(params));
    });

    it("get filter", function() {
        let ctrl = $controller('DiscoverSearch');

        ctrl.filter = 'people';
        expect(ctrl.getFilter()).to.be.eql({is_looking_for_people: true});

        ctrl.filter = 'scrum';
        expect(ctrl.getFilter()).to.be.eql({is_backlog_activated: true});

        ctrl.filter = 'kanban';
        return expect(ctrl.getFilter()).to.be.eql({is_kanban_activated: true});
    });

    it("onChangeFilter", function() {
        let ctrl = $controller('DiscoverSearch');

        mocks.route.updateParams = sinon.stub();

        ctrl.fetchByGlobalSearch = sinon.spy();

        ctrl.onChangeFilter('filter', 'query');

        expect(ctrl.filter).to.be.equal('filter');
        expect(ctrl.q).to.be.equal('query');
        expect(ctrl.fetchByGlobalSearch).to.have.been.called;
        return expect(mocks.route.updateParams).to.have.been.calledWith(sinon.match({filter: 'filter', text: 'query'}));
    });

    it("onChangeOrder", function() {
        let ctrl = $controller('DiscoverSearch');

        mocks.route.updateParams = sinon.stub();

        ctrl.fetchByOrderBy = sinon.spy();

        ctrl.onChangeOrder('order-by');

        expect(ctrl.orderBy).to.be.equal('order-by');
        expect(ctrl.fetchByOrderBy).to.have.been.called;
        return expect(mocks.route.updateParams).to.have.been.calledWith(sinon.match({order_by: 'order-by'}));
    });

    it("fetchByGlobalSearch", function(done) {
        let ctrl = $controller('DiscoverSearch');

        ctrl.fetch = sinon.stub().promise();

        ctrl.fetchByGlobalSearch().then(function() {
            expect(ctrl.loadingGlobal).to.be.false;

            return done();
        });

        expect(ctrl.loadingGlobal).to.be.true;
        expect(ctrl.fetch).to.have.been.called;

        return ctrl.fetch.resolve();
    });

    return it("fetchByOrderBy", function(done) {
        let ctrl = $controller('DiscoverSearch');

        ctrl.fetch = sinon.stub().promise();

        ctrl.fetchByOrderBy().then(function() {
            expect(ctrl.loadingList).to.be.false;

            return done();
        });

        expect(ctrl.loadingList).to.be.true;
        expect(ctrl.fetch).to.have.been.called;

        return ctrl.fetch.resolve();
    });
});
