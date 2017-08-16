var app=angular.module("indexApp", ['ngCookies']);

app.controller('loginCtrl',function ($scope,$http) {
    $scope.login=function () {
        console.log("login");
    }
});