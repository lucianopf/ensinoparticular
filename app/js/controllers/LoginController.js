foodMeApp.controller('LoginController',
    function LoginController($scope, $location, $q, $http) {

    $scope.username = "";
    $scope.password = "";
    $scope.email = "";
    $scope.phone = "";
    $scope.logged = false;
    $scope.path = $location.$$path;
    $scope.session = null;
    $scope.editUser = false;
    $scope.adress = "";
    $scope.teachers = [];

    Parse.initialize("app_password");
    Parse.serverURL = 'https://services-users.herokuapp.com/parse'

    if(Parse.User.current()){
      $scope.logged = true;
      var session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
      $scope.username = session.username;
      $scope.session = session;
    }
    $scope.login = function(){
      localStorage.removeItem('Parse/app_password/currentUser');
      Parse.User.logIn($scope.username, $scope.password, {
        success: function(user) {
          $scope.logged = true;
          $scope.$digest();
        },
        error: function(user, error) {
          alert("Falha ao logar, senha ou nome de usuário incorretos.");
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

    $scope.editUserInfo = function(){
      $scope.editUser = !$scope.editUser;
      $scope.username = $scope.session.username;
      $scope.phone = $scope.session.phone;
      $scope.email = $scope.session.email;
      $scope.lat = $scope.session.geo_lat;
      $scope.long = $scope.session.geo_long;
      reGeocode($scope.lat,$scope.long)
        .then(function(res){
          $scope.adress = res[0].place_name;
        })

    };

    $scope.cancelEdit = function(){
      $scope.email = "";
      $scope.phone = "";
      $scope.adress = "";
      $scope.editUser = false;
      $scope.adress = "";
    };

    $scope.updateUser = function(){
      var User = Parse.Object.extend("User");
      var users = new Parse.Query(User);
      users.get($scope.session.objectId, {
        success: function(user) {
          user.set("email", $scope.email);
          user.set("phone", $scope.phone);
          user.set("username", $scope.username);
          findGeocode($scope.adress)
            .then(function(res){
              user.set("geo_lat", res[0].center[0]);
              user.set("geo_long", res[0].center[1]);
              user.save(null, {
                success: function(user) {
                    $scope.session.email = $scope.email;
                    $scope.session.phone = $scope.phone;
                    $scope.session.username = $scope.username;
                    $scope.editUser = !$scope.editUser;
                    $scope.$digest();
                }
              });
            })
        },
        error: function(object, error) {
          alert(object + error);
        }
      });
    };

    $scope.initMap = function(){
      // mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFub3BmIiwiYSI6ImEyNTFmYTRkNTA5NjFkZWU3Njk5MDczNDNkMGYxODM1In0.InSeGw4XTNjHQx_bnkXalQ';
      // var map = new mapboxgl.Map({
      //     container: 'map', // container id
      //     style: 'mapbox://styles/lucianopf/cioas0pbg004nagm89waja6sy', //stylesheet location
      //     center: [-40.3042, -20.2934], // starting position
      //     zoom: 13 // starting zoom
      // });
      L.mapbox.accessToken = 'pk.eyJ1IjoibHVjaWFub3BmIiwiYSI6ImEyNTFmYTRkNTA5NjFkZWU3Njk5MDczNDNkMGYxODM1In0.InSeGw4XTNjHQx_bnkXalQ';
      var map = L.mapbox.map('map', 'mapbox.streets')
          .setView([-20.288335, -40.289979], 14);

      var User = Parse.Object.extend("User");
      var users = new Parse.Query(User);
      users.equalTo("teacher", true);
      users.find({
        success: function(results) {
          $scope.teachers = results;
          console.log($scope.teachers);
          $scope.$apply();
          results.forEach(function(result){
            L.mapbox.featureLayer({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [
                      result.attributes.geo_lat,
                      result.attributes.geo_long
                    ]
                },
                properties: {
                    title: result.attributes.username,
                    description: result.attributes.email,
                    'marker-size': 'large',
                    'marker-color': '#f55f55',
                    'marker-symbol': 'star'
                }
            }).addTo(map)
          })
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    };


    if($scope.path == "/explore"){
      $scope.initMap();
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

    function reGeocode(lat, long){
      var geoFindString = "";
      geoFindString += "https://api.mapbox.com/geocoding/v5/mapbox.places/";
      geoFindString += lat+","+long;
      geoFindString += ".json?access_token=";
      geoFindString += "pk.eyJ1IjoibHVjaWFub3BmIiwiYSI6ImEyNTFmYTRkNTA5NjFkZWU3Njk5MDczNDNkMGYxODM1In0.InSeGw4XTNjHQx_bnkXalQ";
      return $http.get(geoFindString)
      .then(function(response) {
          return response.data.features;
      });
    };



});
