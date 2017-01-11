'use strict';
/*global angular*/
(function() {
  angular.module("app")
    .factory("userFactory", ["$http", function($http) {

      function logout(id) {
        return $http({
          url: '/auth/signout/',
          method: 'GET',
        });
      }

      function login(user) {
        return $http({
          url: '/auth/login/',
          method: "POST",
          data: user,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function register(user) {
        return $http({
          url: '/auth/signup/',
          method: "POST",
          data: user,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      function check() {
        return $http({
          url: '/auth/check',
          method: "GET",
          catch: true
        });
      }
      return {
        login: login,
        check: check,
        logout: logout,
        register: register,
      };
    }]);
})();
