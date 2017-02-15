'use strict';
/*global angular,MainCtrl,LoginCtrl,RegCtrl,VoterListCtrl,PollListCtrl,
HomeCtrl,NewPollCtrl,EditPollCtrl,VoteCtrl,ResultCtrl,
*/

(function() {
  var app = angular
    .module('app', ['ngRoute', 'ui.bootstrap', 'btford.socket-io',
      'ngSanitize', 'ngTouch', 'ngAnimate', 'ngStorage'
    ])
    .run(function($rootScope, $location) {
      $rootScope.$on("$routeChangeStart", function(event, next) {
        var isAuth = $rootScope.isAuthenticated;
        if (!isAuth) { //user is not logged in
          if (next.$$route) {
            let arr = next.$$route.originalPath.split('/');
            if (arr[1] === "user" || arr[1] === "admin") {
              //access to admin/* or user/* not allowed
              event.preventDefault();
            }
            else if (arr[1] === 'login' || arr[1] === 'register') {
              $location.path(next.$$route.originalPath);
            }
          }
        }
        else { //if user is logged in
          if (next.$$route) {
            let arr = next.$$route.originalPath.split('/');
            if (!$rootScope.user.isAdmin && arr[1] === "admin")
            //access to admin/* not allowed if user is not an admin
              event.preventDefault();
            if (arr[1] === 'login' || arr[1] === 'register')
            //access to login or register page not allowed
              event.preventDefault();
          }
        }
      });
    })
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider

      //authentication
        .when('/login', {
          templateUrl: 'partials/login.html',
          controller: LoginCtrl,
          controllerAs: 'loginCtrl'
        })
        .when('/register', {
          templateUrl: 'partials/register.html',
          controller: RegCtrl,
          controllerAs: 'regCtrl'
        })

      .when('/admin/new_poll', {
        templateUrl: 'partials/newPoll.html',
        controller: NewPollCtrl,
        controllerAs: 'newPollCtrl'
      })

      .when('/user/polls', {
        templateUrl: 'partials/userPolls.html',
        controller: VoterListCtrl,
        controllerAs: 'voterListCtrl'
      })


      .when('/admin/polls', {
          templateUrl: 'partials/adminPolls.html',
          controller: PollListCtrl,
          controllerAs: 'listCtrl'
        })
        .when('/poll', {
          templateUrl: 'partials/poll.html',
          controller: EditPollCtrl,
          controllerAs: 'editCtrl'
        })

      .when('/vote', {
          templateUrl: 'partials/item.html',
          controller: VoteCtrl,
          controllerAs: 'voteCtrl'
        })
        .when('/results', {
          templateUrl: 'partials/results.html',
          controller: ResultCtrl,
          controllerAs: 'resultCtrl'
        })
        .otherwise({
          redirectTo: '/',
          templateUrl: 'partials/home.html',
          controller: HomeCtrl,
          controllerAs: 'homeCtrl'
        });
    }])
    .factory('socket', [
      'socketFactory',
      '$location',
      function(socketFactory) {
        return socketFactory();
      }
    ])
    .service('msgService', [function() {
      this.msg = '';
      this.setMsg = function(msg) {
        this.msg = msg;
      };
      this.getMsg = function() {
        return this.msg;
      };

    }]);
  app.controller('MainCtrl', MainCtrl);
})();
