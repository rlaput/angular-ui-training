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
        'ui.grid.pagination'
    ]);

app.controller('MainCtrl', ['$scope', '$http', '$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants',
    function ($scope, $http, $timeout, $interval, uiGridConstants, uiGridGroupingConstants) {

        $scope.gridOptions = {};
        $scope.gridOptions.data = 'myData';
        $scope.gridOptions.enableColumnResizing = true;
        $scope.gridOptions.enableFiltering = true;
        $scope.gridOptions.enableGridMenu = true;
        $scope.gridOptions.showGridFooter = true;
        // $scope.gridOptions.showColumnFooter = true;
        $scope.gridOptions.fastWatch = true;
        $scope.gridOptions.paginationPageSizes = [10, 25, 50];
        $scope.gridOptions.paginationPageSize = 10;

        $scope.gridOptions.rowIdentity = function (row) {
            return row.id;
        };
        $scope.gridOptions.getRowIdentity = function (row) {
            return row.id;
        };

        $scope.gridOptions.columnDefs = [
            // { name: 'id', visible: false },
            { name: 'PartNumber', enableCellEdit: true, sort: { direction: uiGridConstants.ASC } },
            { name: 'PartDescription', enableCellEdit: true },
            { name: 'Category', enableCellEdit: true },
            { name: 'Price', enableCellEdit: true },
        ];

        $scope.callsPending = 0;

        var productApiLink = 'http://localhost:2403/products/'; // API link for products

        // READ: get all products
        $scope.refreshData = function () {
            $scope.myData = [];

            var sec = $interval(function () {
                $scope.callsPending++;

                $http.get(productApiLink)
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

        // UPDATE: onchange cell value, update row record
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                if (colDef.name === 'Price' && newValue === '') {
                    rowEntity.Price = 0;
                }
                else if (colDef.name === 'Price' && (typeof newValue !== 'number' || newValue < 0)) {
                    showErrorDialog('Price field should be a number and should not be less than 0.');
                    rowEntity.Price = oldValue;
                    return;
                }
                else if (colDef.name === 'PartNumber' && newValue === '') {
                    showErrorDialog('Part Number field is required.');
                    rowEntity.PartNumber = oldValue;
                    return;
                }
                else if (colDef.name === 'PartDescription' && newValue === '') {
                    showErrorDialog('Part Description field is required.');
                    rowEntity.PartDescription = oldValue;
                    return;
                }
                $http.put(productApiLink + rowEntity.id, rowEntity)
                    .success(function () {
                        console.log('{"Column":"' + colDef.name + '","ID":"' + rowEntity.id + '","Old Value":"' + oldValue + '","New Value":"' + newValue + '"}');
                    })
                    .error(function (data) {
                        showErrorDialog(data.message);
                    });
            });
        };
        
        // CREATE: submit new product form
        $scope.addProduct = function () {
            if (!$scope.partNumber || $scope.partNumber === '' ||
                !$scope.partDescription || $scope.partDescription === '') {
                showErrorDialog('Please check required inputs.');
                return;
            }

            if ($scope.price && $scope.price < 0) {
                return;
            }

            var product = {
                PartNumber: $scope.partNumber,
                PartDescription: $scope.partDescription,
                Category: $scope.category,
                Price: $scope.price ? $scope.price : 0
            };

            $http.post(productApiLink, product)
                .success(function (data) {
                    $scope.myData.push(data);
                    showSuccessDialog('Product has been added.');
                    clearProductForm();
                })
                .error(function (data) {
                    showErrorDialog(data.message);
                });
        };
        
        // DELETE: delete selected rows
        $scope.deleteSelected = function () {
            var selectedLength = $scope.gridApi.selection.getSelectedRows().length;

            if (selectedLength == 0) {
                showErrorDialog('Please select part numbers to delete.');
                return;
            }

            var callbackFunction = function (ok) {
                if (ok) {
                    angular.forEach($scope.gridApi.selection.getSelectedRows(), function (data, index) {
                        $http.delete(productApiLink + data.id)
                            .success(function () {
                                console.log('Part number ' + data.PartNumber + ' has been deleted.');
                            })
                            .error(function () {
                                console.log('ERROR encountered while deleting part number ' + data.PartNumber);
                            });
                        $scope.myData.splice($scope.myData.lastIndexOf(data), 1);
                    });

                    showSuccessDialog('Selected part numbers have been deleted.');
                }
            };

            showConfirmDialog('Delete selected ' + selectedLength + ' part number(s)?', callbackFunction);
        };
        
        /**************************************
        * PRIVATE FUNCTIONS
        ***************************************/

        // Hide form and clear fields
        function clearProductForm() {
            $scope.partNumber = '';
            $scope.partDescription = '';
            $scope.category = '';
            $scope.price = '';
            // $scope.showForm = false;
        }

        // Show bootstrap error dialog
        function showErrorDialog(message) {
            BootstrapDialog.show({
                title: 'Error',
                message: message,
                type: BootstrapDialog.TYPE_DANGER
            });
        }

        // Show bootstrap success dialog
        function showSuccessDialog(message) {
            BootstrapDialog.show({
                title: 'Success',
                message: message,
                type: BootstrapDialog.TYPE_SUCCESS
            });
        }

        // Show bootstrap confirm dialog and accept callback function
        function showConfirmDialog(message, callbackFunction) {
            BootstrapDialog.confirm({
                title: 'WARNING',
                message: message,
                type: BootstrapDialog.TYPE_WARNING,
                callback: callbackFunction
            });
        }
        
        /**************************************
        * INITIAL VARIABLES AND FUNCTION CALLS
        ***************************************/
        
        // Product form state: true = shown, false = not shown
        $scope.showForm = false;

        // Refresh data on page load
        $scope.refreshData();
    }]);