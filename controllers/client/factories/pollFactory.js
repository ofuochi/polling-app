'use strict';
/*global angular*/
(function() {
  angular.module("app")
    .factory("pollFactory", function($http) {

      function getPolls() {
        return $http.get("/api/polls", {
          catch: true
        });
      }

      function createPoll(poll) {
        return $http({
          url: '/api/polls',
          method: 'POST',
          data: poll,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function updatePoll(poll, index) {
        return $http({
          url: '/api/polls/' + poll._id,
          method: 'PUT',
          data: {
            isChoice: false,
            poll: poll,
            index: index
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function updatePollChoices(id, choices) {
        return $http({
          url: '/api/polls/' + id,
          method: 'PUT',
          data: {
            isChoice: true,
            choices: choices
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function deletePoll(poll, index) {
        return $http({
          url: '/api/polls/' + poll._id,
          method: 'DELETE',
          data: {
            poll: poll,
            index: index
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function deletePolls() {
        return $http({
          url: '/api/polls',
          method: 'DELETE',
        });
      }

      function getPoll(id) {
        return $http({
          url: '/api/polls/' + id,
          method: 'GET',
          catch: true
        });
      }

      function vote(vote) {
        return $http({
          url: '/api/votes/',
          method: 'POST',
          data: vote,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function getVote(voterId, pollId) {
        return $http({
          url: '/api/votes/' + voterId + '/' + pollId,
          method: 'GET',
          data: {
            _poll: pollId
          },
          headers: {
            'Content-Type': 'application/json'
          },
          catch: true
        });
      }

      return {
        getPolls: getPolls,
        createPoll: createPoll,
        deletePoll: deletePoll,
        deletePolls: deletePolls,
        getPoll: getPoll,
        vote: vote,
        updatePoll: updatePoll,
        updatePollChoices: updatePollChoices,
        getVote: getVote
      };
    });
})();
