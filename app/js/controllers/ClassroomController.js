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

    $scope.videoOn = false;

    $scope.initVideo = function(){
      $scope.videoOn = true;
      var webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: '',
        autoRequestMedia: true
      });
      webrtc.on('readyToCall', function () {
        webrtc.joinRoom('your awesome room name');
      });
      $scope.remotesConnected = 0;
      webrtc.on('videoAdded', function (video, peer) {
          console.log('video added', peer);
          var remotes = document.getElementById('remotesVideos');
          if (remotes) {
              var container = document.createElement('div');
              container.className = 'videoContainer';
              container.id = 'container_' + webrtc.getDomId(peer);
              container.appendChild(video);
              video.oncontextmenu = function () { return false; };
              remotes.appendChild(container);
              $('.videoContainer').find('video').addClass('12u');
              $('.videoContainer').find('video').attr('controls',true)
          }
      });
    }

    $scope.togetherOn = true;

    $scope.initTogether = function(){
      // Config
      $scope.togetherOn = true;
      TogetherJS.config("siteName", "EnsinoParticular");
      TogetherJS.config("toolName", "Compartilhamento");
      TogetherJS.config("cloneClicks", true);
      TogetherJS.config("findRoom", "ensinoparticular-hash");
      TogetherJS.config("suppressJoinConfirmation", true);
      TogetherJS.config("suppressInvite", true);
      TogetherJS.config("youtube", true);
      TogetherJS.config("getUserName", function(){
        return $scope.username;
      });

      TogetherJS(this);
      return false;
    }

    $(function() {
      $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
        $('#colors_demo .tools').append("<a href='#colors_sketch' class='button small' data-color='" + this + "' style='width: 10px; background: " + this + ";'><span style='visibility: hidden'>.</span></a> ");
      });
      $.each([3, 5, 10, 15], function() {
        $('#colors_demo .tools').append("<a href='#colors_sketch' class='button small' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
      });
      $('#colors_sketch').sketch();
    });

});
