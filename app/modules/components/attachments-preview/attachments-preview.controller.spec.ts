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
 * File: attachments-preview.controller.spec.coffee
 */

declare var describe:any;
declare var angular:any;
let module = angular.mock.module;;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("AttachmentsPreviewController", function() {
    let $provide = null;
    let $controller = null;
    let scope = null;
    let mocks:any = {};

    let _mockAttachmentsPreviewService = function() {
        mocks.attachmentsPreviewService = {};

        return $provide.value("tgAttachmentsPreviewService", mocks.attachmentsPreviewService);
    };

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockAttachmentsPreviewService();

            return null;
        })
    ;

    let _inject = () =>
        inject(function(_$controller_, $rootScope) {
            $controller = _$controller_;
            return scope = $rootScope.$new();
        })
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaComponents");

        return _setup();
    });

    it("get current file", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });


        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1
                }
            },
            {
                file: {
                    id: 2
                }
            },
            {
                file: {
                    id: 3
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 2;

        let current = ctrl.getCurrent();

        expect(current.get('id')).to.be.equal(2);
        return expect(ctrl.current.get('id')).to.be.equal(2);
    });


    it("has pagination", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });

        ctrl.getIndex = sinon.stub().returns(0);


        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 2,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 3,
                    name: "xx.jpg"
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 1;

        let pagination = ctrl.hasPagination();

        expect(pagination).to.be.false;

        ctrl.attachments = ctrl.attachments.push(Immutable.fromJS({
            file: {
                id: 4,
                name: "xx.jpg"
            }
        }));

        pagination = ctrl.hasPagination();

        return expect(pagination).to.be.true;
    });

    it("get index", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });


        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1
                }
            },
            {
                file: {
                    id: 2
                }
            },
            {
                file: {
                    id: 3
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 2;

        let currentIndex = ctrl.getIndex();

        return expect(currentIndex).to.be.equal(1);
    });

    it("next", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });

        ctrl.getIndex = sinon.stub().returns(0);


        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 2,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 3,
                    name: "xx.jpg"
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 1;

        let currentIndex = ctrl.next();

        return expect(mocks.attachmentsPreviewService.fileId).to.be.equal(3);
    });

    it("next infinite", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });

        ctrl.getIndex = sinon.stub().returns(2);

        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1,
                    name: "xx.jpg"
                }
            },
            {
                file: {
                    id: 2,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 3,
                    name: "xx.jpg"
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 3;

        let currentIndex = ctrl.next();

        return expect(mocks.attachmentsPreviewService.fileId).to.be.equal(1);
    });

    it("previous", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });

        ctrl.getIndex = sinon.stub().returns(2);


        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1,
                    name: "xx.jpg"
                }
            },
            {
                file: {
                    id: 2,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 3,
                    name: "xx.jpg"
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 3;

        let currentIndex = ctrl.previous();

        return expect(mocks.attachmentsPreviewService.fileId).to.be.equal(1);
    });

    return it("previous infinite", function() {
        let attachment = Immutable.fromJS({
            file: {
                description: 'desc',
                is_deprecated: false
            }
        });

        let ctrl = $controller("AttachmentsPreview", {
            $scope: scope
        });

        ctrl.getIndex = sinon.stub().returns(0);

        ctrl.attachments = Immutable.fromJS([
            {
                file: {
                    id: 1,
                    name: "xx.jpg"
                }
            },
            {
                file: {
                    id: 2,
                    name: "xx"
                }
            },
            {
                file: {
                    id: 3,
                    name: "xx.jpg"
                }
            }
        ]);

        mocks.attachmentsPreviewService.fileId = 1;

        let currentIndex = ctrl.previous();

        return expect(mocks.attachmentsPreviewService.fileId).to.be.equal(3);
     });
});
