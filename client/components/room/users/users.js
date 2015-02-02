

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
    'click .user-list .pseudo': function(e, tmpl){
        Session.set('selectedUser', this._id);
    },
    'click .user-list .send': function(e, tmpl){
        Session.set('sendFileP2PTo', this._id);
    },
    'keyup .find-user > input': function(e, tmpl){
        Session.set('userFilter', e.currentTarget.value.trim());
    }
});


Session.setDefault('maps-api-loaded', false);
Session.setDefault('sendFileP2PTo', null);
var userMap;

Template.users.created = function(){

    Session.set('selectedUser', Session.get("userId"));

    Meteor.defer(function() {
        document.getElementById('p2pFilePicker').onchange = function(e){
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);

            var chunkLength = 1000;

            reader.onload = function (event, text) {
                var data = {}; // data object to transmit over data channel

                if (event) text = event.target.result; // on first invocation

                if (text.length > chunkLength) {
                    data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
                } else {
                    data.message = text;
                    data.last = true;
                }

                dataChannel.send(data); // use JSON.stringify for chrome!

                var remainingDataURL = text.slice(data.message.length);
                if (remainingDataURL.length) setTimeout(function () {
                    onReadAsDataURL(null, remainingDataURL); // continue transmitting
                }, 500)
            };
        };
    });

    Tracker.autorun(function(){
        if( Session.get('sendFileP2PTo') ) {
            $('#p2pFilePicker').trigger('click');
            Session.set('sendFileP2PTo', null);
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

    Tracker.autorun(function() {
        var user = Users.findOne({_id: Session.get('selectedUser')});
        if( !user || !Session.get('maps-api-loaded') )
            return;

        var userPos = new google.maps.LatLng(user.geoPos.latitude, user.geoPos.longitude);
        var marker = new google.maps.Marker({
            position: userPos ,
            map: userMap,
            title: user.name
        });
        userMap.setCenter(userPos);
    });
};


