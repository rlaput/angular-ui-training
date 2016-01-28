'use strict';

angular.module('myApp', [
    'ui.router',
    'myApp.LoginController'
])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'components/login/loginView.html',
                controller: 'LoginCtrl'
            })
            .state('view2', {
                url: '/view2',
                templateUrl: 'components/view2/view2.html'
            });
    });