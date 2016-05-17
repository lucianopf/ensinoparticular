'use strict';

foodMeApp.controller('SignupController',
    function SignupController($scope, $location, $rootScope, $http) {
      $scope.username = "";
      $scope.email = "";
      $scope.telephone = "";
      $scope.password = "";
      $scope.re_password = "";
      $scope.logged = false;
      $scope.teacher = false;
      $scope.lang_english = false;
      $scope.lang_spanish = false;
      $scope.lang_french = false;
      $scope.lang_deutch = false;

      Parse.initialize("app_password");
      Parse.serverURL = 'https://services-users.herokuapp.com/parse';

      if(Parse.User.current()){
        $scope.logged = true;
        var session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
        $scope.username = session.username;
        $location.path('/');
      }

      function findGeocode(endereco){
        var geoFindString = "";
        geoFindString += "https://api.mapbox.com/geocoding/v5/mapbox.places/";
        geoFindString += endereco;
        geoFindString += ".json?access_token=";
        geoFindString += "pk.eyJ1IjoibHVjaWFub3BmIiwiYSI6ImEyNTFmYTRkNTA5NjFkZWU3Njk5MDczNDNkMGYxODM1In0.InSeGw4XTNjHQx_bnkXalQ";
        return $http.get(geoFindString)
        .then(function(response) {
            return response.data.features;
        });
      };

      $scope.clean = function(){
        $scope.username = "";
        $scope.email = "";
        $scope.telephone = "";
        $scope.password = "";
        $scope.re_password = "";
        $scope.logged = false;
        $scope.teacher = false;
        $scope.lang_english = false;
        $scope.lang_spanish = false;
        $scope.lang_french = false;
        $scope.lang_deutch = false;
      }

      $scope.signup = function(){
        var languages = [];
        $scope.lang_english ? languages.push("Ingles") : null;
        $scope.lang_spanish ? languages.push("Espanhol") : null;
        $scope.lang_french ? languages.push("Françes") : null;
        $scope.lang_deutch ? languages.push("Alemão") : null;
        findGeocode($scope.adress)
          .then(function(res){
            var lat = res[0].center[0];
            var long = res[0].center[1];
          })
        localStorage.removeItem('Parse/app_password/currentUser');
        var user = new Parse.User();
        user.set("username", $scope.username);
        user.set("password", $scope.password);
        user.set("email", $scope.email);
        user.set("teacher", $scope.teacher);
        user.set("phone", $scope.telephone);
        user.set("languages", languages);
        findGeocode($scope.adress)
          .then(function(res){
            user.set("geo_lat", res[0].center[0]);
            user.set("geo_long", res[0].center[1]);
            return user.signUp(null, {
              success: function(user) {
                console.log(user);
                $scope.home();
              },
              error: function(user, error) {
                alert("Erro: " + error.message);
                $scope.clean();
              }
            });
          })

      };

      $scope.home = function(){
        $rootScope.$apply(function() {
          $location.path("/");
        });
      }
});
