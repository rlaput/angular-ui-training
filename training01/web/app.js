var app = angular.module('app',
    [
        'ngTouch',
        'ui.grid',
        'ui.grid.cellNav',
        'ui.grid.edit',
        'ui.grid.resizeColumns',
        'ui.grid.pinning',
        'ui.grid.selection',
        'ui.grid.moveColumns',
        'ui.grid.exporter',
        'ui.grid.grouping',
    ]);

app.controller('MainCtrl', ['$scope', '$http', '$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants',
    function ($scope, $http, $timeout, $interval, uiGridConstants, uiGridGroupingConstants) {

        $scope.gridOptions = {};
        $scope.gridOptions.data = 'myData';
        $scope.gridOptions.enableColumnResizing = true;
        $scope.gridOptions.enableFiltering = true;
        $scope.gridOptions.enableGridMenu = true;
        $scope.gridOptions.showGridFooter = true;
        $scope.gridOptions.showColumnFooter = true;
        $scope.gridOptions.fastWatch = true;

        $scope.gridOptions.rowIdentity = function (row) {
            return row.id;
        };
        $scope.gridOptions.getRowIdentity = function (row) {
            return row.id;
        };

        $scope.gridOptions.columnDefs = [
            { name: 'id', visible: false },
            { name: 'PartNumber' },
            { name: 'PartDescription', enableCellEdit: true },
            { name: 'Category', enableCellEdit: true },
            { name: 'Price', enableCellEdit: true },
        ];

        $scope.callsPending = 0;

        $scope.refreshData = function () {
            $scope.myData = [];

            var start = new Date();
            var sec = $interval(function () {
                $scope.callsPending++;

                $http.get('http://localhost:2403/products')
                    .success(function (data) {
                        $scope.callsPending--;

                        data.forEach(function (row) {
                            $scope.myData.push(row);
                        });
                    })
                    .error(function () {
                        $scope.callsPending--
                    });
            }, 200, 1);


            var timeout = $timeout(function () {
                $interval.cancel(sec);
                $scope.left = '';
            }, 2000);

            $scope.$on('$destroy', function () {
                $timeout.cancel(timeout);
                $interval.cancel(sec);
            });

        };

        // Product form state: true = shown, false = not shown
        $scope.showForm = false;

        // onchange cell value
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $http.put('http://localhost:2403/products/' + rowEntity.id, rowEntity);
                console.log('{"Column":"' + colDef.name + '","ID":"' + rowEntity.id + '","Old Value":"' + oldValue + '","New Value":"' + newValue + '"}');
            });
        };

    }]);