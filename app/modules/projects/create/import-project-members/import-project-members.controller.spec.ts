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
 * File: import.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("ImportProjectMembersCtrl", function() {
    let $provide = null;
    let $controller = null;
    let mocks:any = {};

    let _mockCurrentUserService = function() {
        mocks.currentUserService = {
            getUser: sinon.stub().returns(Immutable.fromJS({
                id: 1
            })),
            canAddMembersPrivateProject: sinon.stub(),
            canAddMembersPublicProject: sinon.stub()
        };

        return $provide.value("tgCurrentUserService", mocks.currentUserService);
    };

    let _mockUserService = function() {
        mocks.userService = {
            getContacts: sinon.stub()
        };

        return $provide.value("tgUserService", mocks.userService);
    };

    let _inject = () =>
        inject(_$controller_ => $controller = _$controller_)
    ;

    let _mocks = () =>
        module(function(_$provide_) {
            $provide = _$provide_;

            _mockCurrentUserService();
            _mockUserService();

            return null;
        })
    ;

    let _setup = function() {
        _mocks();
        return _inject();
    };

    beforeEach(function() {
        module("taigaProjects");

        return _setup();
    });

    it("fetch user info", function(done) {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.refreshSelectableUsers = sinon.spy();

        mocks.userService.getContacts.withArgs(1).promise().resolve('contacts');

        return ctrl.fetchUser().then(function() {
            expect(ctrl.userContacts).to.be.equal('contacts');
            expect(ctrl.refreshSelectableUsers).have.been.called;
            return done();
        });
    });

    it("search user", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        let user = {
            id: 1,
            name: "username"
        };

        ctrl.searchUser(user);

        expect(ctrl.selectImportUserLightbox).to.be.true;
        return expect(ctrl.searchingUser).to.be.equal(user);
    });

    it("prepare submit users, warning if needed", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        let user = {
            id: 1,
            name: "username"
        };

        ctrl.selectedUsers = Immutable.fromJS([
            {id: 1},
            {id: 2}
        ]);

        ctrl.members = Immutable.fromJS([
            {id: 1}
        ]);

        ctrl.beforeSubmitUsers();

        return expect(ctrl.warningImportUsers).to.be.true;
    });

    it("prepare submit users, submit", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        let user = {
            id: 1,
            name: "username"
        };

        ctrl.selectedUsers = Immutable.fromJS([
            {id: 1}
        ]);

        ctrl.members = Immutable.fromJS([
            {id: 1}
        ]);


        ctrl.submit = sinon.spy();
        ctrl.beforeSubmitUsers();

        expect(ctrl.warningImportUsers).to.be.false;
        return expect(ctrl.submit).have.been.called;
    });

    it("confirm user", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.discardSuggestedUser = sinon.spy();
        ctrl.refreshSelectableUsers = sinon.spy();

        ctrl.confirmUser('user', 'taiga-user');

        expect(ctrl.selectedUsers.size).to.be.equal(1);

        expect(ctrl.selectedUsers.get(0).get('user')).to.be.equal('user');
        expect(ctrl.selectedUsers.get(0).get('taigaUser')).to.be.equal('taiga-user');
        expect(ctrl.discardSuggestedUser).have.been.called;
        return expect(ctrl.refreshSelectableUsers).have.been.called;
    });

    it("discard suggested user", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.discardSuggestedUser(Immutable.fromJS({
            id: 3
        }));

        return expect(ctrl.cancelledUsers.get(0)).to.be.equal(3);
    });

    it("clean member selection", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.refreshSelectableUsers = sinon.spy();

        ctrl.selectedUsers = Immutable.fromJS([
            {
                user: {
                    id: 1
                }
            },
            {
                user: {
                    id: 2
                }
            }
        ]);

        ctrl.unselectUser(Immutable.fromJS({
            id: 2
        }));

        expect(ctrl.selectedUsers.size).to.be.equal(1);
        return expect(ctrl.refreshSelectableUsers).have.been.called;
    });


    it("get a selected member", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        let member = Immutable.fromJS({
            id: 3
        });

        ctrl.selectedUsers = ctrl.selectedUsers.push(Immutable.fromJS({
            user: {
                id: 3
            }
        }));

        let user = ctrl.getSelectedMember(member);

        return expect(user.getIn(['user', 'id'])).to.be.equal(3);
    });

    it("submit", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.selectedUsers = ctrl.selectedUsers.push(Immutable.fromJS({
            user: {
                id: 3
            },
            taigaUser: {
                id: 2
            }
        }));

        ctrl.selectedUsers = ctrl.selectedUsers.push(Immutable.fromJS({
            user: {
                id: 3
            },
            taigaUser: "xx@yy.com"
        }));


        ctrl.onSubmit = sinon.stub();

        ctrl.submit();

        let user = Immutable.Map();
        user = user.set(3, 2);

        expect(ctrl.onSubmit).have.been.called;
        return expect(ctrl.warningImportUsers).to.be.false;
    });

    it("show suggested match", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.isMemberSelected = sinon.stub().returns(false);
        ctrl.cancelledUsers = [
            3
        ];

        let member = Immutable.fromJS({
            id: 1,
            user: {
                id: 10
            }
        });

        return expect(ctrl.showSuggestedMatch(member)).to.be.true;
    });

    it("doesn't show suggested match", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.isMemberSelected = sinon.stub().returns(false);
        ctrl.cancelledUsers = [
            3
        ];

        let member = Immutable.fromJS({
            id: 3,
            user: {
                id: 10
            }
        });

        return expect(ctrl.showSuggestedMatch(member)).to.be.false;
    });

    it("check users limit", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.members = Immutable.fromJS([
            1, 2, 3
        ]);

        mocks.currentUserService.canAddMembersPrivateProject.withArgs(4).returns('xx');
        mocks.currentUserService.canAddMembersPublicProject.withArgs(4).returns('yy');

        ctrl.checkUsersLimit();

        expect(ctrl.limitMembersPrivateProject).to.be.equal('xx');
        return expect(ctrl.limitMembersPublicProject).to.be.equal('yy');
    });


    it("get distict select taiga users excluding the current user", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");
        ctrl.selectedUsers = Immutable.fromJS([
            {
                taigaUser: {
                    id: 1
                }
            },
            {
                taigaUser: {
                    id: 1
                }
            },
            {
                taigaUser: {
                    id: 3
                }
            },
            {
                taigaUser: {
                    id: 5
                }
            }
        ]);

        ctrl.currentUser = Immutable.fromJS({
            id: 5
        });

        let users = ctrl.getDistinctSelectedTaigaUsers();

        return expect(users.size).to.be.equal(2);
     });

    it("refresh selectable users array with all users available", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.isImportMoreUsersDisabled = sinon.stub().returns(false);
        ctrl.displayEmailSelector = false;

        ctrl.userContacts = Immutable.fromJS([1]);
        ctrl.currentUser = 2;

        ctrl.refreshSelectableUsers();

        expect(ctrl.selectableUsers.toJS()).to.be.eql([1, 2]);
        return expect(ctrl.displayEmailSelector).to.be.true;
     });


    it("refresh selectable users array with the selected ones", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.getDistinctSelectedTaigaUsers = sinon.stub().returns(Immutable.fromJS([
            {taigaUser: 1}
        ]));
        ctrl.displayEmailSelector = false;

        ctrl.isImportMoreUsersDisabled = sinon.stub().returns(true);

        ctrl.userContacts = Immutable.fromJS([1]);
        ctrl.currentUser = 2;

        ctrl.refreshSelectableUsers();

        expect(ctrl.selectableUsers.toJS()).to.be.eql([1, 2]);
        return expect(ctrl.displayEmailSelector).to.be.false;
     });

    it("import more user disable in private project", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.project = Immutable.fromJS({
            is_private: true
        });

        ctrl.getDistinctSelectedTaigaUsers = sinon.stub().returns(Immutable.fromJS([1,2,3]));

        mocks.currentUserService.canAddMembersPrivateProject.withArgs(5).returns({valid: true});

        return expect(ctrl.isImportMoreUsersDisabled()).to.be.false;
    });

    return it("import more user disable in public project", function() {
        let ctrl = $controller("ImportProjectMembersCtrl");

        ctrl.project = Immutable.fromJS({
            is_private: false
        });

        ctrl.getDistinctSelectedTaigaUsers = sinon.stub().returns(Immutable.fromJS([1,2,3]));

        mocks.currentUserService.canAddMembersPublicProject.withArgs(5).returns({valid: true});

        return expect(ctrl.isImportMoreUsersDisabled()).to.be.false;
    });
});
