foodMeApp.controller('LoginController',
    function LoginController($scope, $location, $q, $http, $rootScope) {

    $scope.username = "";
    $scope.password = "";
    $scope.email = "";
    $scope.phone = "";
    $scope.logged = false;
    $scope.path = $location.$$path;
    $scope.session = null;
    $scope.editUser = false;
    $scope.adress = "";
    $scope.description = "";
    $scope.teachers = [];
    $scope.tasks = null;


    $scope.test = "";

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
          $scope.session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
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
      $scope.session = JSON.parse(localStorage.getItem('Parse/app_password/currentUser'));
      $scope.editUser = !$scope.editUser;
      $scope.username = $scope.session.username;
      $scope.phone = $scope.session.phone;
      $scope.email = $scope.session.email;
      $scope.lat = $scope.session.geo_lat;
      $scope.long = $scope.session.geo_long;
      $scope.description = $scope.session.description;
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
      $scope.description = "";
    };

    $scope.updateUser = function(){
      var User = Parse.Object.extend("User");
      var users = new Parse.Query(User);
      users.get($scope.session.objectId, {
        success: function(user) {
          user.set("email", $scope.email);
          user.set("phone", $scope.phone);
          user.set("username", $scope.username);
          user.set("description", $scope.description);
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
      L.mapbox.accessToken = 'pk.eyJ1IjoibHVjaWFub3BmIiwiYSI6ImEyNTFmYTRkNTA5NjFkZWU3Njk5MDczNDNkMGYxODM1In0.InSeGw4XTNjHQx_bnkXalQ';
      var map = L.mapbox.map('map', 'mapbox.streets')
          .setView([-20.288335, -40.289979], 14);

      var User = Parse.Object.extend("User");
      var users = new Parse.Query(User);
      users.equalTo("teacher", true);
      users.find({
        success: function(results) {
          $scope.teachers = results;
          $scope.$apply();
          results.forEach(function(result){
            var eu = L.mapbox.featureLayer({
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
            });
            eu.on('click', function(){
              $("html, body").animate({
                scrollTop: $("#"+result.id).offset().top - 40
              }, 500);
            });
            eu.addTo(map);
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

    $scope.languageChosen = null;
    $scope.teacherChosen = null;
    $scope.dayChosen = null;
    $scope.availableHours = null;
    $scope.chosenHour = null;
    $scope.teacherChosenId = null;
    $scope.tipoChosen = 'presencial';
    $scope.recurrentChosen = false;
    $scope.eventObservations = null;

    $scope.$watch('dayChosen', function() {
      $scope.availableHours = getAvailableHours(8,19)
      var Events = Parse.Object.extend("Events");
      var events = new Parse.Query(Events);
      var UserFind = Parse.Object.extend("User");
      var user = new UserFind();
      user.id = $scope.teacherChosenId;
      try{
        events.equalTo("teacher", user);
      }catch(err){
        // console.log(err)
      }
      events.equalTo("dia", $scope.dayChosen);
      events.find({
        success: function(results) {
          var events = results.map(function(result){
            return result.attributes;
          })
          var changeAfter = $scope.availableHours;
          events.forEach(function(event){
            changeAfter = changeAfter.filter(function(hora){
              return hora != event.hora;
            })
          })
          $scope.availableHours = changeAfter;
          $scope.$apply();
        },
        error: function(error) {
          console.log(error)
        }
      });
    });


    function getAvailableHours(begin, end){
      var hours = []
      for(var i = begin; i < end; i++){
        hours.push(i + ":00 - " + (i+1)+":00")
      }
      return hours
    }

    $scope.scheduleClass = function(teacher, language, teacherId){
      $scope.languageChosen = language
      $scope.teacherChosen = teacher.username
      $scope.teacherChosenId = teacherId
    }

    $scope.saveEvent = function(){

      var Event = Parse.Object.extend("Events");
      var User = Parse.Object.extend("User");
      var teacher = new User();
      teacher.id = $scope.teacherChosenId
      var student = new User();
      student.id = $scope.session.objectId
      var event = new Event();

      event.set("done", false);
      event.set("language", $scope.languageChosen);
      event.set("state", "requested");
      $scope.tipoChosen == "presencial" ? event.set('remote', false) : event.set('remote', true);
      event.set('observations', $scope.eventObservations);
      event.set('dia', $scope.dayChosen);
      event.set('hora', $scope.chosenHour);
      event.set('recurrent', $scope.recurrentChosen);
      event.set('teacher', teacher);
      event.set('student', student);
      event.save(null, {
        success: function(event) {
          $scope.$apply(function(){
            $location.url("/");
            $('#calendar-prof').modal('hide');
          })
        },
        error: function(event, error) {
          alert('Failed to create new object, with error code: ' + error.message);
        }
      });
    }

    if($scope.session){
      var Events = Parse.Object.extend("Events");
      var events = new Parse.Query(Events);
      var studentEvents = new Parse.Query(Events);
      var UserFind = Parse.Object.extend("User");
      var user = new UserFind();
      user.id = $scope.session.objectId;
      try{
        events.equalTo("teacher", user);
        studentEvents.equalTo("student", user);
      }catch(err){
        // console.log(err)
      }
      events.equalTo("done", false);
      studentEvents.equalTo("done", false);
      var mainQuery = Parse.Query.or(events, studentEvents);

      mainQuery.descending("createdAt");
      mainQuery.find().
        then(
          function(results){
            results.forEach(function(result){
              result.attributes.student.fetch();
              result.attributes.teacher.fetch();
            });
            $scope.tasks = results;
            console.log(results);
          },
          function(err){
            console.log(err);
          }
        )
    }

    $scope.eventChosen = null;

    $scope.showTaskInfo = function(i){
      $scope.eventChosen = $scope.tasks[i];
    }

    $scope.acceptEvent = function(i){
      if(i){
        $scope.showTaskInfo(i);
      }
      $scope.eventChosen.set("state","approved");
      $scope.eventChosen.save().then(
        function(res){
          console.log(res);
          $('#event-info').modal('hide');
        },
        function(err){alert(err);}
      )
    }

    $scope.refuseEvent = function(i){
      if(i){
        $scope.showTaskInfo(i);
      }
      $scope.eventChosen.set("state","refused");
      $scope.eventChosen.set("done", true);
      $scope.eventChosen.save().then(
        function(res){
          console.log(res);
          $('#event-info').modal('hide');
        },
        function(err){alert(err);}
      )
    }

    $scope.startEvent = function(i){
      if(i){
        $scope.showTaskInfo(i);
      }
      $rootScope.eventStarted = $scope.eventChosen;
      $location.url('/classroom');
      console.log("start event");
    }
    // console.log(session)
});
