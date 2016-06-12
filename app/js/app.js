'use strict';

var foodMeApp = angular.module('foodMeApp', ['ngResource']);

foodMeApp.config(function($routeProvider) {

  $routeProvider.
      when('/', {
        controller: 'LoginController',
        templateUrl: 'views/login.html'
      }).
      when('/explore', {
        controller: 'LoginController',
        templateUrl: 'views/explore.html'
      }).
      when('/classroom', {
        controller: 'ClassroomController',
        templateUrl: 'views/classroom.html'
      }).
      when('/assessments', {
        controller: 'AssessmentsController',
        templateUrl: 'views/assessments.html'
      }).
      when('/signup', {
        controller: 'SignupController',
        templateUrl: 'views/signup.html'
      }).
      when('/thank-you', {
        controller: 'ThankYouController',
        templateUrl: 'views/thank-you.html'
      }).
      when('/customer', {
        controller: 'CustomerController',
        templateUrl: 'views/customer.html'
      }).
      when('/who-we-are', {
        templateUrl: 'views/who-we-are.html'
      }).
      when('/how-it-works', {
        templateUrl: 'views/how-it-works.html'
      }).
      when('/help', {
        templateUrl: 'views/help.html'
      });
});
