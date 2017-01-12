'use strict';
/*global angular*/

function HomeCtrl() {
  var homeCtrl = this;
}

function VoterListCtrl($location, pollFactory,
  $sessionStorage, $rootScope, socket) {
  var voterListCtrl = this;
  voterListCtrl.polls = [];
  var userVotes = [];
  voterListCtrl.isVote = false;
  pollFactory.getPolls()
    .success(function(data) {
      var userId = $rootScope.user._id;
      if (data) {
        data.forEach(function(poll) {
          voterListCtrl.polls.push(poll);
          for (let i = 0; i < poll.votes.length; i++) {
            let vote = poll.votes[i];
            if (userId === vote._voter) userVotes.push(vote);
          }
        });
      }
    })
    .error(function(err) {
      console.log(err);
    });

  socket.on('server:createPoll', function(data) {
    voterListCtrl.polls.push(data.poll);
  });
  socket.on('server:updateOne', function(data) {
    voterListCtrl.polls[data.index] = data.poll;
  });
  socket.on('server:deleteOne', function(data) {
    voterListCtrl.polls.splice(data.index, 1);
  });
  socket.on('server:deleteAll', function() {
    voterListCtrl.polls = [];
  });
  voterListCtrl.isVoted = function(poll) {
    for (let i = 0; i < userVotes.length; i++) {
      let vote = userVotes[i];
      if (vote._poll === poll._id) return voterListCtrl.isVote = true;
      voterListCtrl.isVote = false;
    }
  };
  voterListCtrl.vote = function(index, poll) {
    $sessionStorage.savedPoll = {
      index: index,
      poll: poll
    };
    $location.path('/vote');
  };
  voterListCtrl.result = function(index, poll) {
    $sessionStorage.savedPoll = {
      index: index,
      poll: poll,
      choice: $sessionStorage.savedPoll.choice
    };
    $location.path('/results');
  };
}

function PollListCtrl($location, pollFactory, $sessionStorage) {

  var listCtrl = this;
  listCtrl.polls = [];


  listCtrl.closeAlert = function(index) {
    listCtrl.alerts.splice(index, 1);
  };
  listCtrl.alerts = [];


  pollFactory.getPolls()
    .success(function(data) {
      listCtrl.polls = data;
    })
    .error(function(err, status) {
      console.log(err);
      if (status === 400) {
        listCtrl.alerts.push({
          type: 'danger',
          msg: err
        });
      }
    });



  listCtrl.toggleActive = function(index, data) {
    listCtrl.alerts = [];
    listCtrl.polls[index].status = true;
    // angular.element(document.querySelector('#tr-' + index))
    //   .children().prop('disabled', true);
    data.isActive = !data.isActive;

    pollFactory.updatePoll(data, index)
      .success(function(data, status) {
        if (status === 200) {
          listCtrl.polls[index].isActive = data.isActive;
          listCtrl.polls[index].status = false;
        }
      })
      .error(function(err, status) {
        listCtrl.polls[index].isActive = !data.isActive;
        listCtrl.polls.forEach(function(row) {
          row.status = false;
        });
        console.log(err);
        if (status === 400) {
          listCtrl.alerts.push({
            type: 'danger',
            msg: err
          });
        }
      });
  };
  listCtrl.delete = function(index, poll) {
    listCtrl.polls[index].status = true;

    pollFactory.deletePoll(poll, index)
      .success(function() {
        listCtrl.polls[index].status = false;
        angular.element(document.querySelector('#tr-' + index)).remove();
        listCtrl.polls.splice(index, 1);
      })
      .error(function(err) {
        console.log(err);
        listCtrl.polls.forEach(function(row) {
          row.status = true;
        });

      });
  };
  listCtrl.deleteAll = function() {
    pollFactory.deletePolls()
      .success(function(data, status) {
        if (status === 200) {
          listCtrl.polls = [];
          angular.element(document.querySelector('#close').click());
        }
      })
      .error(function(data, status) {
        console.log(status);
      });
  };

  listCtrl.edit = function(index, poll) {
    $sessionStorage.savedPoll = {
      index: index,
      poll: poll
    };
    $location.path('/poll');
  };


}

function RegCtrl($location, userFactory, msgService) {
  var regCtrl = this;
  regCtrl.user = {
    username: '',
    password: '',
    name: '',
    email: ''
  };

  regCtrl.closeAlert = function(index) {
    regCtrl.alerts.splice(index, 1);
  };
  regCtrl.alerts = [];

  regCtrl.register = function() {
    regCtrl.alerts = [];

    userFactory.register(regCtrl.user)
      .success(function(user) {
        if (user.message.error) {
          var error = user.message.error;
          error.forEach(function(err) {
            regCtrl.alerts.push({
              type: 'danger',
              msg: err
            });
          });
        }
        else {
          var success = user.message.success[0];
          msgService.setMsg(success);
          $location.path("/login");
        }
      })
      .error(function(err) {
        console.log(new Error('Error here' + err));
      });
  };
}

function MainCtrl($window, $location, userFactory,
  $rootScope, $sessionStorage) {
  $rootScope.user = $sessionStorage.user;
  $rootScope.isAuthenticated = $rootScope.user ? true : false;
  $rootScope.goHome = function() {
    $window.location.href = '/';
  };
  $rootScope.isActive = function(viewLocation) {
    return $location.path().indexOf(viewLocation) == 0;
  };
  $rootScope.logout = function() {
    userFactory.logout()
      .success(function() {
        $window.location.href = '/';
        $rootScope.isAuthenticated = false;
        $rootScope.user = undefined;
        $sessionStorage.user = undefined;
      });
  };
}

function LoginCtrl($window, $location, userFactory,
  msgService, $sessionStorage, $rootScope) {
  var loginCtrl = this;
  loginCtrl.user = $sessionStorage.user;
  loginCtrl.alerts = [];
  if (msgService.getMsg()) {
    loginCtrl.alerts = [{
      type: 'success',
      msg: msgService.getMsg()
    }];
  }

  loginCtrl.closeAlert = function(index) {
    loginCtrl.alerts.splice(index, 1);
  };
  loginCtrl.login = function() {
    loginCtrl.alerts = [];

    userFactory.login(loginCtrl.user)
      .success(function(user) {
        if (user.message.error) {
          var error = user.message.error;
          error.forEach(function(err) {
            loginCtrl.alerts.push({
              type: 'danger',
              msg: err
            });
          });
        }
        else {

          $sessionStorage.user = {
            username: user.user.username,
            isAdmin: user.user.isAdmin,
            polls: user.user.polls,
            _id: user.user._id
          };
          $rootScope.user = $sessionStorage.user;
          $window.location.href = '/';
        }
      })
      .error(function(err) {
        console.log(new Error('Error here' + err));
      });
  };
}

function NewPollCtrl($location, pollFactory) {
  var newPollCtrl = this;
  newPollCtrl.disabled = false;
  newPollCtrl.poll = {
    question: {
      text: '',
      choices: [{
          text: '',
          id: '',
          count: 0
        },

        {
          text: '',
          id: '',
          count: 0

        }
      ]
    }
  };
  newPollCtrl.closeAlert = function(index) {
    newPollCtrl.alerts.splice(index, 1);
  };
  newPollCtrl.alerts = [];

  let createdAtPlus1 =
    (new Date()).setDate((new Date()).getDate() + 1);
  newPollCtrl.deadline = createdAtPlus1;
  newPollCtrl.deadlineTime = newPollCtrl.deadline;
  newPollCtrl.dateChange = function(inputedDate) {
    inputedDate = new Date(inputedDate).getTime();
    let now = new Date(Date.now()).getTime();
    if (inputedDate < now) {
      newPollCtrl.deadline = Date.now();
    }
    newPollCtrl.deadlineTime = newPollCtrl.deadline;
  };
  newPollCtrl.changedTime = function(time) {
    newPollCtrl.deadline = time;
  };
  newPollCtrl.open = function() {
    newPollCtrl.popup.opened = true;
    newPollCtrl.dateOptions.minDate = new Date();
  };

  newPollCtrl.popup = {
    opened: false
  };

  newPollCtrl.addChoice = function() {
    newPollCtrl.poll.question.choices.push({
      text: '',
      id: '',
      count: 0,
    });
  };

  newPollCtrl.createPoll = function() {
    newPollCtrl.disabled = true;

    let deadline = new Date(newPollCtrl.deadline);
    newPollCtrl.poll.expiry_date = deadline;
    let poll = newPollCtrl.poll;
    pollFactory.createPoll(poll)
      .success(function(data, status) {
        newPollCtrl.disabled = false;

        $location.path("/admin/polls");
      })
      .error(function(err, status) {
        console.log(err);
        newPollCtrl.disabled = false;
        if (status === 400) {
          newPollCtrl.alerts.push({
            type: 'danger',
            msg: err
          });
        }
      });
  };
  newPollCtrl.close = function(index) {
    newPollCtrl.poll.question.choices.splice(index, 1);
  };
}

function EditPollCtrl($location, pollFactory, $sessionStorage) {

  var editCtrl = this;
  editCtrl.disabled = false;
  var poll = $sessionStorage.savedPoll;
  editCtrl.pollIndex = poll.index;
  editCtrl.poll = poll.poll;

  editCtrl.closeAlert = function(index) {
    editCtrl.alerts.splice(index, 1);
  };
  editCtrl.alerts = [];

  let createdAt = $sessionStorage.savedPoll.poll.createdAt;
  let createdAtPlus1 =
    (new Date()).setDate((new Date(createdAt)).getDate() + 1);

  editCtrl.deadline = new Date(editCtrl.poll.expiry_date) || createdAtPlus1;

  editCtrl.deadlineTime = editCtrl.deadline;

  editCtrl.changedTime = function(time) {
    editCtrl.deadlineTime = time;
  };

  editCtrl.isExpired = function() {
    let deadline = new Date(editCtrl.deadline);
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < date ? '(expired!)' : null;
  };
  editCtrl.dateChange = function(inputedDate) {
    inputedDate = new Date(inputedDate).getTime();
    let now = new Date(Date.now()).getTime();
    if (inputedDate < now)
      editCtrl.deadline = Date.now();
  };

  editCtrl.open = function() {
    editCtrl.popup.opened = true;
    editCtrl.dateOptions.minDate = new Date();
  };



  editCtrl.popup = {
    opened: false
  };


  editCtrl.addChoice = function() {
    editCtrl.poll.question.choices.push({
      text: ''
    });
  };

  editCtrl.editPoll = function() {
    editCtrl.alerts = [];
    editCtrl.disabled = true;
    let expiryDate = new Date(editCtrl.deadline);
    expiryDate.setHours(editCtrl.deadlineTime.getHours());
    expiryDate.setMinutes(editCtrl.deadlineTime.getMinutes());
    expiryDate.setSeconds(editCtrl.deadlineTime.getSeconds());
    editCtrl.poll.expiry_date = expiryDate;
    pollFactory.updatePoll(editCtrl.poll, poll.index)
      .success(function() {
        $location.path("/admin/polls");
        editCtrl.disabled = false;
      })
      .error(function(err, status) {
        console.log(err);
        editCtrl.disabled = false;
        if (status === 400) {
          editCtrl.alerts.push({
            type: 'danger',
            msg: err
          });
        }
      });
  };
  editCtrl.close = function(index) {
    editCtrl.poll.question.choices.splice(index, 1);
  };
}

function VoteCtrl($location, pollFactory, $sessionStorage) {
  var voteCtrl = this;
  voteCtrl.choiceText = '';
  voteCtrl.choiceId = '';
  voteCtrl.isVoted = false;
  voteCtrl.poll = $sessionStorage.savedPoll.poll;
  voteCtrl.index = $sessionStorage.savedPoll.index;

  voteCtrl.vote = function() {

    var count = voteCtrl.poll.question.choices[voteCtrl.choiceId].count;

    var vote = { //create vote
      choice: {
        _id: voteCtrl.choiceId,
        text: voteCtrl.poll.question.choices[voteCtrl.choiceId].text,
        count: count + 1
      },
      _poll: voteCtrl.poll._id,
      _user: $sessionStorage.user._id
    };

    pollFactory.vote(vote) //register the created vote
      .success(function(poll, status) {
        if (status === 200) {

          var i = voteCtrl.choiceId;
          var p = voteCtrl.poll;
          p.question.choices[i].count++;
          pollFactory.updatePollChoices(
              p._id,
              p.question.choices)
            .success(function(updatedPoll) {
              voteCtrl.isVoted = true;
              voteCtrl.poll = updatedPoll;
              $sessionStorage.savedPoll = {
                index: voteCtrl.index,
                poll: updatedPoll,
                choice: vote.choice
              };
            })
            .error(function(err) {
              console.log(err);
            });

        }
        else {}
      })
      .error(function(err) {
        console.log(err);
      });
  };
}

function ResultCtrl($sessionStorage, socket) {
  var resultCtrl = this;
  resultCtrl.poll = $sessionStorage.savedPoll.poll;
  resultCtrl.pollIndex = $sessionStorage.savedPoll.index;
  resultCtrl.choice = $sessionStorage.savedPoll.choice;
  socket.on('server:updateChoices', function(data) {
    resultCtrl.poll = data.poll;

  });
}
