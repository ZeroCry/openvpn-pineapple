registerController('openvpn_Controller', ['$api', '$scope', '$rootScope', '$interval', '$timeout', function($api, $scope, $rootScope, $interval, $timeout) {
	$scope.title = "Loading...";
	$scope.version = "Loading...";

  $scope.refreshInfo = (function() {
		$api.request({
            module: 'openvpn',
            action: "refreshInfo"
        }, function(response) {
						$scope.title = response.title;
						$scope.version = "v"+response.version;
        })
    });

		$scope.refreshInfo();

}]);


registerController('openvpn_ControlsController', ['$api', '$scope', '$rootScope', '$interval', '$timeout', function($api, $scope, $rootScope, $interval, $timeout) {
	$scope.status = "Loading...";
	$scope.statusLabel = "default";
	$scope.starting = false;

	$scope.install = "Loading...";
	$scope.installLabel = "default";
	$scope.processing = false;

	$scope.device = '';
	$scope.sdAvailable = false;

	$rootScope.status = {
		installed : false,
		refreshOutput : false,
		refreshHistory : false
	};

  $scope.refreshStatus = (function() {
		$api.request({
            module: "openvpn",
            action: "refreshStatus"
        }, function(response) {
            $scope.status = response.status;
			$scope.statusLabel = response.statusLabel;

			$rootScope.status.installed = response.installed;
			$scope.device = response.device;
			$scope.sdAvailable = response.sdAvailable;
			if(response.processing) $scope.processing = true;
			$scope.install = response.install;
			$scope.installLabel = response.installLabel;
        })
    });

  $scope.toggleopenvpn = (function() {
		if($scope.status != "Stop")
			$scope.status = "Starting...";
		else
			$scope.status = "Stopping...";

		$scope.statusLabel = "warning";
		$scope.starting = true;

		$api.request({
		        module: 'openvpn',
		        action: 'toggleopenvpn',
		        command: $rootScope.command
		    }, function(response) {
		        $timeout(function(){
							$rootScope.status.refreshOutput = true;
							$rootScope.status.refreshHistory = false;

							$scope.starting = false;
							$scope.refreshStatus();

							$scope.scanInterval = $interval(function(){
									$api.request({
											module: 'openvpn',
											action: 'scanStatus'
									}, function(response) {
											if (response.success === true){
													$interval.cancel($scope.scanInterval);
													$rootScope.status.refreshOutput = false;
													$rootScope.status.refreshHistory = true;
											}
											$scope.refreshStatus();
									});
							}, 5000);

		        }, 2000);
		    })
	});

  $scope.handleDependencies = (function(param) {
    if(!$rootScope.status.installed)
			$scope.install = "Installing...";
		else
			$scope.install = "Removing...";

		$api.request({
            module: 'openvpn',
            action: 'handleDependencies',
            destination: param
        }, function(response){
            if (response.success === true) {
				$scope.installLabel = "warning";
				$scope.processing = true;

                $scope.handleDependenciesInterval = $interval(function(){
                    $api.request({
                        module: 'openvpn',
                        action: 'handleDependenciesStatus'
                    }, function(response) {
                        if (response.success === true){
                            $scope.processing = false;
                            $interval.cancel($scope.handleDependenciesInterval);
                            $scope.refreshStatus();
                        }
                    });
                }, 5000);
            }
        });
    });

	$scope.refreshStatus();
}]);



registerController('openvpn_ConfigurationController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
	$scope.configurationData = '';
	$scope.saveConfigurationLabel = "primary";
	$scope.saveConfiguration = "Save";
	$scope.saving = false;

	$scope.saveConfigurationData = (function() {
		$scope.saveConfigurationLabel = "warning";
		$scope.saveConfiguration = "Saving...";
		$scope.saving = true;

		$api.request({
			module: 'openvpn',
			action: 'saveConfigurationData',
			configurationData: $scope.configurationData
		}, function(response) {
            $scope.saveConfigurationLabel = "success";
						$scope.saveConfiguration = "Saved";

            $timeout(function(){
                $scope.saveConfigurationLabel = "primary";
								$scope.saveConfiguration = "Save";
								$scope.saving = false;
            }, 2000);
		});
	});

	$scope.getConfigurationData = (function() {
		$api.request({
			module: 'openvpn',
			action: 'getConfigurationData'
		}, function(response) {
			$scope.configurationData = response.configurationData;
		});
	});

	$scope.getConfigurationData();
}]);
