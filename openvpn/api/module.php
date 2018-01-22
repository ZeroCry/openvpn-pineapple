<?php namespace pineapple;

putenv('LD_LIBRARY_PATH='.getenv('LD_LIBRARY_PATH').':/sd/lib:/sd/usr/lib');
putenv('PATH='.getenv('PATH').':/sd/usr/bin:/sd/usr/sbin');


class openvpn extends Module
{
    public function route()
    {
        switch ($this->request->action) {
			case 'refreshInfo':
				$this->refreshInfo();
				break;
            case 'refreshStatus':
                $this->refreshStatus();
                break;
            case 'handleDependencies':
                $this->handleDependencies();
                break;
            case 'handleDependenciesStatus':
                $this->handleDependenciesStatus();
                break;
            case 'toggleopenvpn':
                $this->toggleopenvpn();
                break;
            case 'saveConfigurationData':
                $this->saveConfigurationData();
                break;
            case 'getConfigurationData':
                $this->getConfigurationData();
                break;
            case 'saveConfigurationCreds':
                $this->saveConfigurationData();
                break;
            case 'getConfigurationCreds':
                $this->getConfigurationData();
                break;
            case 'toggleopenvpnOnBoot':
                $this->toggleopenvpnOnBoot();
                break;
            case 'refreshOutput':
                $this->refreshOutput();
                break;
            case 'getInterfaces':
                $this->getInterfaces();
                break;
        }
    }
    
    
        protected function checkDependency($dependencyName)
        {
            return ((exec("which {$dependencyName}") == '' ? false : true) && ($this->uciGet("openvpn.module.installed")));
        }

        protected function getDevice()
        {
            return trim(exec("cat /proc/cpuinfo | grep machine | awk -F: '{print $2}'"));
        }      

        protected function refreshInfo()
        {
            $moduleInfo = @json_decode(file_get_contents("/pineapple/modules/openvpn/module.info"));
            $this->response = array('title' => $moduleInfo->title, 'version' => $moduleInfo->version);
        }
    
    
    
    private function handleDependencies()
    {
		if(!$this->checkDependency("openvpn"))
		{
	        $this->execBackground("/pineapple/modules/openvpn/scripts/dependencies.sh install ".$this->request->destination);
	        $this->response = array('success' => true);
		}
		else
		{
	        $this->execBackground("/pineapple/modules/openvpn/scripts/dependencies.sh remove");
	        $this->response = array('success' => true);
		}
	}   
    
    private function handleDependenciesStatus()
    {
        if (!file_exists('/tmp/openvpn.progress'))
		{
            $this->response = array('success' => true);
        }
		else
		{
            $this->response = array('success' => false);
        }
    }    
    
    private function refreshStatus()
    {
        if (!file_exists('/tmp/openvpn.progress'))
		{
			if (!$this->checkDependency("openvpn"))
			{
				$installed = false;
				$install = "Not installed";
				$installLabel = "danger";
				$processing = false;

				$status = "Start";
				$statusLabel = "success";

				$bootLabelON = "default";
				$bootLabelOFF = "danger";
			}
			else
			{
				$installed = true;
				$install = "Installed";
				$installLabel = "success";
				$processing = false;

				if($this->checkRunning("openvpn"))
				{
					$status = "Stop";
					$statusLabel = "danger";
				}
				else
				{
					$status = "Start";
					$statusLabel = "success";
				}

				if(exec("cat /etc/rc.local | grep openvpn/scripts/autostart_openvpn.sh") == "")
				{
					$bootLabelON = "default";
					$bootLabelOFF = "danger";
				}
				else
				{
					$bootLabelON = "success";
					$bootLabelOFF = "default";
				}
			}
        }
		else
		{
			$installed = false;
			$install = "Installing...";
			$installLabel = "warning";
			$processing = true;

			$status = "Not running";
			$statusLabel = "danger";

			$bootLabelON = "default";
			$bootLabelOFF = "danger";
    }

		$device = $this->getDevice();
		$sdAvailable = $this->isSDAvailable();

		$this->response = array("device" => $device, "sdAvailable" => $sdAvailable, "status" => $status, "statusLabel" => $statusLabel, "installed" => $installed, "install" => $install, "installLabel" => $installLabel, "bootLabelON" => $bootLabelON, "bootLabelOFF" => $bootLabelOFF, "processing" => $processing);
	}
    
    private function toggleopenvpnOnBoot()
    {
		if(exec("cat /etc/rc.local | grep openvpn/scripts/autostart_openvpn.sh") == "")
		{
			exec("sed -i '/exit 0/d' /etc/rc.local");
			exec("echo /pineapple/modules/openvpn/scripts/autostart_openvpn.sh >> /etc/rc.local");
			exec("echo exit 0 >> /etc/rc.local");
		}
		else
		{
			exec("sed -i '/openvpn\/scripts\/autostart_openvpn.sh/d' /etc/rc.local");
		}
	}
    
    private function toggleopenvpn()
    {
        if(!$this->checkRunning("openvpn"))
        {
            $this->execBackground("/pineapple/modules/openvpn/scripts/openvpn.sh start");
        }
        else
        {
            $this->execBackground("/pineapple/modules/openvpn/scripts/openvpn.sh stop");
        }
    }

    private function saveConfigurationData()
    {
        $filename = '/pineapple/modules/openvpn/files/client.ovpn';
        file_put_contents($filename, $this->request->configurationData);
    }

    private function getConfigurationData()
    {
        $configurationData = file_get_contents('/pineapple/modules/openvpn/files/client.ovpn');
        $this->response = array("configurationData" => $configurationData);
    }
    
    private function saveConfigurationCreds()
    {
        $filename = '/pineapple/modules/openvpn/files/creds.txt';
        file_put_contents($filename, $this->request->configurationData);
    }

    private function getConfigurationCreds()
    {
        $configurationData = file_get_contents('/pineapple/modules/openvpn/files/creds.txt');
        $this->response = array("configurationData" => $configurationData);
    }    

    private function refreshOutput()
    {
		if($this->checkDependency("openvpn"))
		{
			if ($this->checkRunning("openvpn"))
			{
				if(file_exists("/pineapple/modules/openvpn/connections.log"))
				{
					if ($this->request->filter != "")
					{
						$filter = $this->request->filter;

						$cmd = "cat /pineapple/modules/openvpn/connections.log"." | ".$filter;
					}
					else
					{
						$cmd = "cat /pineapple/modules/openvpn/connections.log";
					}

					exec ($cmd, $output);
					if(!empty($output))
						$this->response = implode("\n", array_reverse($output));
					else
						$this->response = "Empty connections log...";
				}
				else
				{
					$this->response =  "No connections log...";
				}
			}
			else
			{
				 $this->response = "openvpn is not running...";
			}
		}
		else
		{
			$this->response = "openvpn is not installed...";
		}
    }
    
    private function getInterfaces()
    {
        $interface_name = exec("ifconfig | grep  'encap:UNSPEC'  | cut -d' ' -f1"); $interface_name = $interface_name != "" ? $interface_name : "-";
        $ip_address = exec("ifconfig ".$interface_name." | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}'"); $ip_address = $ip_address != "" ? $ip_address : "-";
        $subnet_mask = exec("ifconfig ".$interface_name." | grep 'inet addr:' | cut -d: -f4 | awk '{ print $1}'"); $subnet_mask = $subnet_mask != "" ? $subnet_mask : "-";

        $wan = @file_get_contents("http://cloud.wifipineapple.com/ip.php"); $wan = $wan != "" ? $wan : "-";
        $gateway = exec("netstat -r | grep 'default' | grep ".$interface_name." | awk '{ print $2}'"); $gateway = $gateway != "" ? $gateway : "-";

        $info = array( "name" => $interface_name,
                       "ip" =>$ip_address,
                       "subnet" => $subnet_mask,
                       "gateway" => $gateway,
                       'wanIpAddress' => $wan
                      );

        $this->response = array('info' => $info);
    }
  
}