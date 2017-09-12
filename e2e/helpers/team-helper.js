var utils = require('../utils');

var helper = module.exports;

helper.team = function() {
  let el = $('.team');

  let obj = {
      el: el,
      firstRole: function() {
        return el.$$('tg-team-members .avatar span').first();
      },

      firstMember: function() {
        return el.$$('tg-team-members a.name').first();
      },

      count: function() {
        return el.$$('tg-team-members .row.member').count();
      },

      leave: function() {
        el.$(".hero .username a").click();
      }
  };

  return obj;
};

helper.filters = function() {
  let el = $('.team-filters-inner');

  let obj = {
      el: el,
      filterByRole: function(roleName) {
        let roles = el.$$("ul li a");
        roles.filter(function(role) {
          return role.getText().then(function(text) {
            return text.toLowerCase() === roleName.toLowerCase();
          });
        }).click();
      },

      clearText: function(text) {
        el.$('form.search-in input').clear();
      },

      searchText: function(text) {
        el.$('form.search-in input').sendKeys(text);
      }
  };

  return obj;
};

helper.leavingProjectWarningLb = async function() {
    return utils.common.getElm('tg-lightbox[key="team.leave-project"]');
};

helper.isLeaveProjectWarningOpen = async function() {
    let lb = await helper.leavingProjectWarningLb();
    return lb.isPresent();
};
