

Template.users.helpers({
    users: function(){
        return Users.find({},{
            sort: {name: 1}
        });
    },
    showUser: function(){
        var filter = Session.get('userFilter');
        if(!filter  || filter.trim().length == 0)
            return true;
        return this.name.match(new RegExp(filter, 'i'));
    },
    isCurrentUser: function(){
        return Session.get('userId') === this._id;
    },
    isSelectedUser: function(){
        return Session.get('selectedUser') === this._id;
    }
});

Template.users.events({
    'click .user-list > div': function(e, tmpl){
        Session.set('selectedUser', this._id);
    },
    'keyup .find-user > input': function(e, tmpl){
        Session.set('userFilter', e.currentTarget.value.trim());
    }

});


Session.setDefault('maps-api-loaded', false);
var userMap;

Template.users.created = function(){

    Session.set('selectedUser', Session.get("userId"));

    Tracker.autorun(function() {
        var user = Users.findOne({_id: Session.get('selectedUser')});
        if( !user || !Session.get('maps-api-loaded') )
            return;

        if( Session.get('maps-api-loaded') ) {
            var userPos = new google.maps.LatLng(user.geoPos.latitude, user.geoPos.longitude);
            var marker = new google.maps.Marker({
                position: userPos ,
                map: userMap,
                title: user.name
            });
            userMap.setCenter(userPos);
        }
    });

    Tracker.autorun(function(){
        if( Session.get('maps-script-loaded') ) {
            Meteor.defer(function(){
                userMap = new google.maps.Map(document.getElementById("map-canvas"), {
                    zoom: 8,
                    center: new google.maps.LatLng(0, 0)
                });
                Session.set('maps-api-loaded', true);
            });
        }
    });
};


