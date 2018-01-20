<?php namespace pineapple;
putenv('LD_LIBRARY_PATH='.getenv('LD_LIBRARY_PATH').':/sd/lib:/sd/usr/lib');
putenv('PATH='.getenv('PATH').':/sd/usr/bin:/sd/usr/sbin');

/* The class name must be the name of your module, without spaces. */
/* It must also extend the "Module" class. This gives your module access to API functions */
class openvpn extends Module
{
    public function route()
    {
        switch ($this->request->action) {
            case 'refreshInfo':    // If you request the action "getContents" from your Javascript, this is where the PHP will see it, and use the correct function
            $this->refreshInfo();  // $this->getContents(); refers to your private function that contains all of the code for your request.
            break;                 // Break here, and add more cases after that for different requests.
        }
    }
    
    protected function refreshInfo()
    {
        $moduleInfo = @json_decode(file_get_contents("/pineapple/modules/openvpn/module.info"));
        $this->response = array('title' => $moduleInfo->title, 'version' => $moduleInfo->version);
    }
}




