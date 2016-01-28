'use strict';

angular.module('myApp.LoginController', [
    'myApp'
])

    .controller('LoginCtrl', [
        '$rootScope',
        function ($rootScope) {
            var login = this;

            login.username = '';

            login.submit = function (user) {
                $rootScope.userName = user.username;
            }
        }
    ]);