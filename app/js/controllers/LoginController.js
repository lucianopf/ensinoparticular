foodMeApp.controller('LoginController',
    function LoginController($scope, $location, $q) {

    $scope.username = "";
    $scope.password = "";
    $scope.logged = false;

    Parse.initialize("app_password");
    Parse.serverURL = 'https://services-users.herokuapp.com/parse'

    if(Parse.User.current()){
      $scope.logged = true;
      var session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
      $scope.username = session.username;
    }

    $scope.login = function(){
      localStorage.removeItem('Parse/app_password/currentUser');
      Parse.User.logIn($scope.username, $scope.password, {
        success: function(user) {
          $scope.logged = true;
          $scope.$digest();
          console.log(user);
        },
        error: function(user, error) {
          alert("Falha ao logar");
        }
      });
    };
    $scope.logout = function(){
      localStorage.removeItem('Parse/app_password/currentUser');
      Parse.User.logOut();
      $scope.logged = false;
      $scope.$digest();
    };

});
