PlayersList = new Mongo.Collection('players');

if(Meteor.isClient) {

  Template.leaderboard.helpers({
    'player': function() {
      var currentUserId = Meteor.userId();
      return PlayersList.find({createdBy: currentUserId}, {sort: {score: -1, name: 1}});
    },
    'selectedClass': function() {
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if(playerId === selectedPlayer) {
        return 'selected';
      }

      return;
    },
    'selectedPlayer': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne({_id: selectedPlayer});
    }
  });

  Template.leaderboard.events({
    'click .player': function(e) {
      var playerId = this._id;
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      PlayersList.update({ _id: selectedPlayer}, {$inc: { score: 5}} );
    },
    'click .decrement': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      PlayersList.update({ _id: selectedPlayer}, {$inc: { score: -5}} );
    },
    'click .remove': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('removePlayer', selectedPlayer);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(e) {
      e.preventDefault();
      var playerNameVar = e.target.playerName.value;
      Meteor.call('createPlayer', playerNameVar);
      e.target.playerName.value = '';
    }
  });

  Meteor.subscribe('thePlayer');
}

if(Meteor.isServer) {
  Meteor.publish('thePlayer', function() {
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});
  })

}

Meteor.methods({
  'createPlayer': function(playerNameVar) {
    check(playerNameVar, String);
    var currentUserId = Meteor.userId();
    if(playerNameVar.length > 0 && currentUserId) {
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      });
    }
  },
  'removePlayer': function(selectedPlayer) {
    check(selectedPlayer, String);
    var currentUserId = Meteor.userId();
    if(currentUserId) {
      PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
    }
  }
});
