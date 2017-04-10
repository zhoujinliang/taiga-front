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
 * File: suggest-add-members.controller.spec.coffee
 */

declare var describe:any;
declare var module:any;
declare var inject:any;
declare var it:any;
declare var expect:any;
declare var beforeEach:any;
import * as Immutable from "immutable"
import * as sinon from "sinon"

describe("SuggestAddMembersController", function() {
    let suggestAddMembersCtrl =  null;
    let provide = null;
    let controller = null;
    let mocks:any = {};

    let _mocks = () =>
        module(function($provide) {
            provide = $provide;
            return null;
        })
    ;

    beforeEach(function() {
        module("taigaAdmin");

        _mocks();

        return inject($controller => controller = $controller);
    });

    it("is email - wrong", function() {
        suggestAddMembersCtrl = controller("SuggestAddMembersCtrl");
        suggestAddMembersCtrl.contactQuery = 'lololo';

        let result = suggestAddMembersCtrl.isEmail();
        return expect(result).to.be.false;
    });

    it("is email - true", function() {
        suggestAddMembersCtrl = controller("SuggestAddMembersCtrl");
        suggestAddMembersCtrl.contactQuery = 'lololo@lolo.com';

        let result = suggestAddMembersCtrl.isEmail();
        return expect(result).to.be.true;
    });

    it("filter contacts", function() {
        suggestAddMembersCtrl = controller("SuggestAddMembersCtrl");
        suggestAddMembersCtrl.contacts = Immutable.fromJS([
            {
                full_name_display: 'Abel Sonofadan',
                username: 'abel'
            },
            {
                full_name_display: 'Cain Sonofadan',
                username: 'cain'
            }
        ]);

        suggestAddMembersCtrl.contactQuery = 'Cain Sonofadan';

        suggestAddMembersCtrl.filterContacts();
        return expect(suggestAddMembersCtrl.filteredContacts.size).to.be.equal(1);
    });

    return it("set invited", function() {
        suggestAddMembersCtrl = controller("SuggestAddMembersCtrl");

        let contact = 'contact';

        suggestAddMembersCtrl.onInviteSuggested = sinon.stub();

        suggestAddMembersCtrl.setInvited(contact);
        return expect(suggestAddMembersCtrl.onInviteSuggested).has.been.calledWith({'contact': contact});
    });
});
