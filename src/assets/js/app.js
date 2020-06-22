
var app =  angular.module('chatApp', ['firebase']);
app.controller('chatController', ['$scope','Message', function($scope,Message){

$scope.name = "Coder01";
$scope.messages= Message.all;
}]);
app.factory('Message', [function() {

var messages = [{'name':'Pippo','text':'Hello'},
{'name':'Pluto','text':'Hello'},
{'name':'Pippo','text':'how are you ?'},
{'name':'Pluto','text':'fine thanks'},
{'name':'Pippo','text':'Bye'},
{'name':'Pluto','text':'Bye'}];

var Message = {
all: messages
};

return Message;

}]);