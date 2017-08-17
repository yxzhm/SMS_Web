var app=angular.module("indexApp", ['ngCookies']);

app.controller('loginCtrl',function ($scope,$http,$window, $location) {
    $scope.login=function () {
        console.log("login");
        var host = 'http://'+$location.host()+":"+$location.port();
        $http({
            method: 'POST',
            url: host + '/api/auth',
            data: '{ "phone": "'+$scope.phone+'", "password": "'+$scope.psw+'"  }',
            headers: {
                'Content-Type': 'application/json'
            },
            transformResponse: [function (data) {
                if(data.toString().length>0){
                    var jumpto = host+'/sms?uuid='+data.toString();
                    window.location =jumpto;
                }
                else{
                    $window.alert('Login Fail');
                }
            }]
        }).error(function (data, status, header, config) {
                console.log(header());
                console.log(config);
                $window.alert('Login Fail');
            });

        //     .success(function (data, status, header, config) {
        //     if (data.toString().length > 0) {
        //         token = data.toString();
        //         $location.path('/status');
        //     }
        //
        // }).error(function (data, status, header, config) {
        //     console.log(header());
        //     console.log(config);
        // });



    }
});