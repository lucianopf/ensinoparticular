'use strict';

foodMeApp.controller('SignupController',
    function SignupController($scope, $location, $rootScope) {
      $scope.username = "";
      $scope.email = "";
      $scope.telephone = "";
      $scope.password = "";
      $scope.re_password = "";
      $scope.logged = false;
      $scope.teacher = false;

      Parse.initialize("app_password");
      Parse.serverURL = 'https://services-users.herokuapp.com/parse';

      if(Parse.User.current()){
        $scope.logged = true;
        var session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
        $scope.username = session.username;
        $location.path('/');
      }

      $scope.clean = function(){
        $scope.username = "";
        $scope.email = "";
        $scope.telephone = "";
        $scope.password = "";
        $scope.re_password = "";
        $scope.logged = false;
      }

      $scope.signup = function(){
        localStorage.removeItem('Parse/app_password/currentUser');
        var user = new Parse.User();
        user.set("username", $scope.username);
        user.set("password", $scope.password);
        user.set("email", $scope.email);
        user.set("teacher", $scope.teacher);
        user.set("phone", $scope.telephone);

        user.signUp(null, {
          success: function(user) {
            console.log(user);
            $scope.home();
          },
          error: function(user, error) {
            alert("Erro: " + error.message);
            $scope.clean();
          }
        });
      };

      $scope.home = function(){
        $rootScope.$apply(function() {
          $location.path("/");
        });
      }
});
