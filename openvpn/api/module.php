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
            }
            else
            {
                $installed = true;
                $install = "Installed";
                $installLabel = "success";
                $processing = false;

                if ($this->checkRunning("openvpn"))
                {
                    $status = "Stop";
                    $statusLabel = "danger";
                }
                else
                {
                    $status = "Start";
                    $statusLabel = "success";
                }
            }
        }
        else
        {
            $installed = false;
            $install = "Installing...";
            $installLabel = "warning";
            $processing = true;

            $status = "Start";
            $statusLabel = "success";
        }

        $device = $this->getDevice();
        $sdAvailable = $this->isSDAvailable();

        $this->response = array("device" => $device, "sdAvailable" => $sdAvailable, "status" => $status, "statusLabel" => $statusLabel, "installed" => $installed, "install" => $install, "installLabel" => $installLabel, "processing" => $processing);
	}    
  
}




