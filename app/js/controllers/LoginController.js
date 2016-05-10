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

    function togetherSetup(local){
      TogetherJS.config("dontShowClicks", true);
      TogetherJS.config("findRoom", local);
      TogetherJS.config("suppressJoinConfirmation", true);
      TogetherJS.config("youtube", true);
      TogetherJS.config("getUserName", function () {return $scope.username;} );

    };

    $scope.togetherNewSession = function(name, cb){
      var TogetherRoom = Parse.Object.extend("TogetherRooms");
      var togetherRoom = new TogetherRoom();
      togetherRoom.set("name", name);
      togetherRoom.set("active", true);
      togetherRoom.save(null, {
        success: function(togetherRoom) {
          console.log(togetherRoom);
          cb();
        },
        error: function(togetherRoom, error) {
          console.log(togetherRoom, error);
        }
      });
    }

    $scope.togetherCheckSession = function(name, cb){
      var TogetherRoom = Parse.Object.extend("TogetherRooms");
      var query = new Parse.Query(TogetherRoom);
      query.equalTo("name", name);
      query.equalTo("active", true);
      var exists = false;
      query.find({
        success: function(results) {
          if(results.length)
            exists = true;
          cb(exists, name);
        },
        error: function(error) {
          cb(exists, error);
        }
      });
    }

    $scope.togetherInit = function(local){
      if(TogetherJS.running)
        TogetherJS();
      sessionStorage.removeItem('togetherjs-session.status');
      togetherSetup(local);
      TogetherJS(this);
    };

    $scope.togetherDecideWheterJoin = function(exists, name){
      if(exists){
        $scope.togetherInit(name);
      }else{
        $scope.togetherNewSession(name,
          $scope.togetherInit
        );
      }
    };

    $scope.togetherLocal = function(){
      $scope.togetherCheckSession($scope.username,
        $scope.togetherDecideWheterJoin
      );
    };

    $scope.togetherShared = function(){
      $scope.togetherInit('Room-1');
    };

});
