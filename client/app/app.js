angular.module('todo', ['ngRoute', 'todo.services', 'todo.auth', 'todo.map'])
  .config(function($routeProvider, $httpProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController'
    })
    .when('/signout', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when('/map', {
      templateUrl: 'app/map/map.html',
      controller: 'MapController',
      authenticate: true
    });
})
