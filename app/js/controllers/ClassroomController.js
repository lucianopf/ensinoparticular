foodMeApp.controller('ClassroomController',
    function ClassroomController($scope, $location, $q, $http) {

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

    var webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: 'localVideo',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: 'remotesVideos',
      // immediately ask for camera access
      autoRequestMedia: true
    });

    // we have to wait until it's ready
    webrtc.on('readyToCall', function () {
      // you can name it anything
      webrtc.joinRoom('your awesome room name');
    });

    
    console.log("aqui")
});