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
 * File: discover-projects.service.spec.coffee
 */

describe("tgDiscoverProjectsService", function() {
    let provide;
    let discoverProjectsService = (provide = null);
    let mocks = {};

    let _mockResources = function() {
        mocks.resources = {
            projects: {
                getProjects: sinon.stub()
            },
            stats: {
                discover: sinon.stub()
            }
        };

        return provide.value("tgResources", mocks.resources);
    };

    let _mockProjectsService = function() {
        mocks.projectsService = {
            _decorate(content) {
                return content.set('decorate', true);
            }
        };

        return provide.value("tgProjectsService", mocks.projectsService);
    };

    let _inject = callback =>
        inject(function(_tgDiscoverProjectsService_) {
            discoverProjectsService = _tgDiscoverProjectsService_;
            if (callback) { return callback(); }
        })
    ;

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockResources();
            _mockProjectsService();
            return null;
        })
    ;

    let _setup = () => _mocks();

    beforeEach(function() {
        module("taigaDiscover");
        _setup();
        return _inject();
    });

    it("fetch most liked", function(done) {
        let params = {test: 1, discover_mode: true};

        mocks.resources.projects.getProjects.withArgs(sinon.match(params), false).promise().resolve({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
                {id: 4},
                {id: 5},
                {id: 6},
                {id: 7}
            ]
        });

        return discoverProjectsService.fetchMostLiked(params).then(function() {
            let result = discoverProjectsService._mostLiked.toJS();

            expect(result).to.have.length(5);
            expect(result[0].decorate).to.be.ok;

            return done();
        });
    });

    it("fetch most active", function(done) {
        let params = {test: 1, discover_mode: true};

        mocks.resources.projects.getProjects.withArgs(sinon.match(params), false).promise().resolve({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
                {id: 4},
                {id: 5},
                {id: 6},
                {id: 7}
            ]
        });

        return discoverProjectsService.fetchMostActive(params).then(function() {
            let result = discoverProjectsService._mostActive.toJS();

            expect(result).to.have.length(5);
            expect(result[0].decorate).to.be.ok;

            return done();
        });
    });

    it("fetch featured", function(done) {
        let params = {is_featured: true, discover_mode: true};
        mocks.resources.projects.getProjects.withArgs(sinon.match(params), false).promise().resolve({
            data: [
                {id: 1},
                {id: 2},
                {id: 3},
                {id: 4},
                {id: 5},
                {id: 6},
                {id: 7}
            ]
        });

        return discoverProjectsService.fetchFeatured().then(function() {
            let result = discoverProjectsService._featured.toJS();

            expect(result).to.have.length(4);
            expect(result[0].decorate).to.be.ok;

            return done();
        });
    });

    it("reset search list", function() {
        discoverProjectsService._searchResult = 'xxx';

        discoverProjectsService.resetSearchList();

        return expect(discoverProjectsService._searchResult.size).to.be.equal(0);
    });

    it("fetch stats", function(done) {
        mocks.resources.stats.discover.promise().resolve(Immutable.fromJS({
            projects: {
                total: 3
            }
        }));

        return discoverProjectsService.fetchStats().then(function() {
            expect(discoverProjectsService._projectsCount).to.be.equal(3);

            return done();
        });
    });

    return it("fetch search", function(done) {
        let params = {test: 1, discover_mode: true};

        let result = {
            headers: sinon.stub(),
            data: [
                {id: 1},
                {id: 2},
                {id: 3}
            ]
        };

        result.headers.withArgs('X-Pagination-Next').returns('next');

        mocks.resources.projects.getProjects.withArgs(sinon.match(params)).promise().resolve(result);

        discoverProjectsService._searchResult = Immutable.fromJS([
            {id: 4},
            {id: 5}
        ]);

        return discoverProjectsService.fetchSearch(params).then(function() {
            result = discoverProjectsService._searchResult.toJS();

            expect(result).to.have.length(5);

            expect(result[4].decorate).to.be.ok;

            return done();
        });
    });
});
