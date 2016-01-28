'use strict';

angular.module('myApp.LoginController', [
    'myApp'
])

    .controller('LoginCtrl', [
        '$rootScope',
        'MainService',
        function ($rootScope, MainService) {
            var login = this;

            login.username = '';

            login.submit = function (user) {
                // MainService.setUsername(user.username);
                $rootScope.userName = user.username;
            }
        }
    ]);