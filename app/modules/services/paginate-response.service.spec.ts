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
 * File: paginate-response.service.spec.coffee
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

describe("PaginateResponseService", function() {
    let paginateResponseService = null;

    let _inject = () =>
        inject(_tgPaginateResponseService_ => paginateResponseService = _tgPaginateResponseService_)
    ;

    beforeEach(function() {
        module("taigaCommon");
        return _inject();
    });

    return it("convert angualr pagination response to an object", function() {
        let headerMock = sinon.stub();

        headerMock.withArgs("x-pagination-next").returns(true);
        headerMock.withArgs("x-pagination-prev").returns(false);
        headerMock.withArgs("x-pagination-current").returns(5);
        headerMock.withArgs("x-pagination-count").returns(234);

        let serverResponse = Immutable.Map({
            data: ['11', '22'],
            headers: headerMock
        });

        let result = paginateResponseService(serverResponse);

        result = result.toJS();

        expect(result.data).to.have.length(2);
        expect(result.next).to.be.true;
        expect(result.prev).to.be.false;
        expect(result.current).to.be.equal(5);
        return expect(result.count).to.be.equal(234);
    });
});
