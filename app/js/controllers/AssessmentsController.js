'use strict';

foodMeApp.controller('AssessmentsController',
    function AssessmentsController($scope, $location) {
      $scope.question = "";
      $scope.subject = "";
      $scope.answers = [];
      $scope.answer = "";
      $scope.correct = "";
      $scope.addAnswer = function(){
        if($scope.answer.length == 0)
          return;
        $scope.answers.push($scope.answer);
        $scope.answer = "";
      };

      $scope.redefineFields = function(){
        $scope.question = "";
        $scope.subject = "";
        $scope.answers = [];
        $scope.answer = "";
        $scope.correct = "";
      };

      Parse.initialize("app_password");
      Parse.serverURL = 'https://services-assessments.herokuapp.com/parse';
      $scope.saveQuestion = function(){
        console.log("Entrei");
        var Questions = Parse.Object.extend("Questions");
        var question = new Questions();

        question.set("question", $scope.question);
        question.set("possible_answers", $scope.answers);
        question.set("subject", $scope.subject);
        question.set("correct_answer", $scope.correct);

        question.save(null, {
        success: function(question) {
          // Execute any logic that should take place after the object is saved.
          console.log('New object created with objectId: ' + question.id);
          alert("Question saved");
          $scope.redefineFields();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          console.log('Failed to create new object, with error code: ' + error.message);
        }
        });
      };
});
