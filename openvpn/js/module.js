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
    
    $scope.bootLabelON = "default";
	$scope.bootLabelOFF = "default";

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
            
            $scope.bootLabelON = response.bootLabelON;
			$scope.bootLabelOFF = response.bootLabelOFF;
        })
    });
    
    $scope.toggleopenvpnOnBoot = (function() {
            if($scope.bootLabelON == "default")
            {
                $scope.bootLabelON = "success";
                $scope.bootLabelOFF = "default";
            }
            else
            {
                $scope.bootLabelON = "default";
                $scope.bootLabelOFF = "danger";
            }

            $api.request({
                module: 'openvpn',
                action: 'toggleopenvpnOnBoot',
            }, function(response) {
                $scope.refreshStatus();
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
    
    $scope.toggleopenvpnOnBoot = (function() {
        if($scope.bootLabelON == "default")
		{
			$scope.bootLabelON = "success";
			$scope.bootLabelOFF = "default";
		}
		else
		{
			$scope.bootLabelON = "default";
			$scope.bootLabelOFF = "danger";
		}

		$api.request({
            module: 'openvpn',
            action: 'toggleopenvpnOnBoot',
        }, function(response) {
			$scope.refreshStatus();
        })
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


registerController('openvpn_CredentialsController', ['$api', '$scope', '$timeout', function($api, $scope, $timeout) {
	$scope.configurationData = '';
	$scope.saveConfigurationLabel = "primary";
	$scope.saveConfiguration = "Save";
	$scope.saving = false;

	$scope.saveConfigurationCreds = (function() {
		$scope.saveConfigurationLabel = "warning";
		$scope.saveConfiguration = "Saving...";
		$scope.saving = true;

		$api.request({
			module: 'openvpn',
			action: 'saveConfigurationCreds',
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

	$scope.getConfigurationCreds = (function() {
		$api.request({
			module: 'openvpn',
			action: 'getConfigurationCreds'
		}, function(response) {
			$scope.configurationData = response.configurationData;
		});
	});

	$scope.getConfigurationData();
}]);


registerController('openvpn_OutputController', ['$api', '$scope', '$rootScope', '$interval', function($api, $scope, $rootScope, $interval) {
    $scope.output = 'Loading...';
	$scope.filter = '';

	$scope.refreshLabelON = "default";
	$scope.refreshLabelOFF = "danger";

    $scope.refreshOutput = (function() {
		$api.request({
            module: "openvpn",
            action: "refreshOutput",
			filter: $scope.filter
        }, function(response) {
            $scope.output = response;
        })
    });

    $scope.clearFilter = (function() {
        $scope.filter = '';
        $scope.refreshOutput();
    });

    $scope.toggleAutoRefresh = (function() {
        if($scope.autoRefreshInterval)
		{
			$interval.cancel($scope.autoRefreshInterval);
			$scope.autoRefreshInterval = null;
			$scope.refreshLabelON = "default";
			$scope.refreshLabelOFF = "danger";
		}
		else
		{
			$scope.refreshLabelON = "success";
			$scope.refreshLabelOFF = "default";

			$scope.autoRefreshInterval = $interval(function(){
				$scope.refreshOutput();
	        }, 5000);
		}
    });

    $scope.refreshOutput();

		$rootScope.$watch('status.refreshOutput', function(param) {
			if(param) {
				$scope.refreshOutput();
			}
		});

}]);




registerController('openvpn_InterfaceController', ['$api', '$scope', '$rootScope', '$filter', '$sce', function($api, $scope, $rootScope, $filter, $sce) {
	$scope.info = {
        name : "Loading...",
        ip : "Loading...",
        subnet : "Loading...",
        gateway : "Loading...",
		wanIpAddress : "Loading..."
	};

	$scope.title = "Loading...";
	$scope.output = "Loading...";

	$scope.loading = false;


	$scope.getInfo = function() {
			$scope.loading = true;

			$api.request({
					module: 'openvpn',
					action: 'getInterfaces'
			}, function(response) {
					$scope.info = response.info;
					$scope.loading = false;
			});
	};

	$scope.getInfo();

}]);




