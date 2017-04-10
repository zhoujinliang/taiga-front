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
 * File: lightbox-add-members.controller.spec.coffee
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

describe("AddMembersController", function() {
    let addMembersCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mockUserService = function() {
        mocks.userService = {
            getContacts: sinon.stub()
        };

        return provide.value("tgUserService", mocks.userService);
    };

    let _mockCurrentUser = function() {
        mocks.currentUser = {
            getUser: sinon.stub()
        };

        return provide.value("tgCurrentUserService", mocks.currentUser);
    };

    let _mockProjectService = function() {
        mocks.projectService = {
            project: sinon.stub()
        };

        return provide.value("tgProjectService", mocks.projectService);
    };

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            _mockCurrentUser();
            _mockUserService();
            _mockProjectService();
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaAdmin");

        _mocks();

        return inject($controller => controller = $controller);
    });


    it("get user contacts", function(done) {

        let userId = 1;
        let excludeProjectId = 1;

        mocks.currentUser.getUser.returns(Immutable.fromJS({
            id: userId
        }));
        mocks.projectService.project = Immutable.fromJS({
            id: excludeProjectId
        });

        let contacts = Immutable.fromJS({
            username: "username",
            full_name_display: "full-name-display",
            bio: "bio"
        });

        mocks.userService.getContacts.withArgs(userId, excludeProjectId).promise().resolve(contacts);

        addMembersCtrl = controller("AddMembersCtrl");

        return addMembersCtrl._getContacts().then(function() {
            expect(addMembersCtrl.contacts).to.be.equal(contacts);
            return done();
        });
    });

    it("filterContacts", function() {

        addMembersCtrl = controller("AddMembersCtrl");
        addMembersCtrl.contacts = Immutable.fromJS([
            {id: 1},
            {id: 2}
        ]);
        let invited = Immutable.fromJS({id: 1});

        addMembersCtrl._filterContacts(invited);

        return expect(addMembersCtrl.contacts.size).to.be.equal(1);
    });

    it("invite suggested", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        addMembersCtrl.contactsToInvite = Immutable.List();
        addMembersCtrl.displayContactList = false;

        let contact = Immutable.fromJS({id: 1});

        addMembersCtrl._filterContacts = sinon.stub();

        addMembersCtrl.inviteSuggested(contact);
        expect(addMembersCtrl.contactsToInvite.size).to.be.equal(1);
        expect(addMembersCtrl._filterContacts).to.be.calledWith(contact);
        return expect(addMembersCtrl.displayContactList).to.be.true;
    });

    it("remove contact", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        addMembersCtrl.contactsToInvite = Immutable.fromJS([
            {id: 1},
            {id: 2}
        ]);
        let invited = {id: 1};
        addMembersCtrl.contacts = Immutable.fromJS([]);

        addMembersCtrl.testEmptyContacts = sinon.stub();

        addMembersCtrl.removeContact(invited);
        expect(addMembersCtrl.contactsToInvite.size).to.be.equal(1);
        expect(addMembersCtrl.contacts.size).to.be.equal(1);
        return expect(addMembersCtrl.testEmptyContacts).to.be.called;
    });

    it("invite email", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        let email = 'email@example.com';
        let emailData = Immutable.Map({'email': email});
        addMembersCtrl.displayContactList = false;

        addMembersCtrl.emailsToInvite = Immutable.fromJS([]);

        addMembersCtrl.inviteEmail(email);
        expect(emailData.get('email')).to.be.equal(email);
        expect(addMembersCtrl.emailsToInvite.size).to.be.equal(1);
        return expect(addMembersCtrl.displayContactList).to.be.true;
    });

    it("remove email", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        let invited = {email: 'email@example.com'};
        addMembersCtrl.emailsToInvite = Immutable.fromJS([
            {'email': 'email@example.com'},
            {'email': 'email@example2.com'}
        ]);

        addMembersCtrl.testEmptyContacts = sinon.stub();

        addMembersCtrl.removeEmail(invited);
        expect(addMembersCtrl.emailsToInvite.size).to.be.equal(1);
        return expect(addMembersCtrl.testEmptyContacts).to.be.called;
    });

    it("test empty contacts - not empty", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        addMembersCtrl.displayContactList = true;
        addMembersCtrl.emailsToInvite = Immutable.fromJS([
            {'email': 'email@example.com'},
            {'email': 'email@example2.com'}
        ]);
        addMembersCtrl.contactsToInvite = Immutable.fromJS([
            {'id': 1},
            {'id': 1}
        ]);
        addMembersCtrl.testEmptyContacts();
        return expect(addMembersCtrl.displayContactList).to.be.true;
    });

    return it("test empty contacts - empty", function() {
        addMembersCtrl = controller("AddMembersCtrl");
        addMembersCtrl.displayContactList = true;
        addMembersCtrl.emailsToInvite = Immutable.fromJS([]);
        addMembersCtrl.contactsToInvite = Immutable.fromJS([]);
        addMembersCtrl.testEmptyContacts();
        return expect(addMembersCtrl.displayContactList).to.be.false;
    });
});
