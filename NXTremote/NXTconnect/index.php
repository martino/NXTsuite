<?php
include('xmlrpc.inc');

$serverAddress = "192.168.5.107";
$serverPort = 8088;
$serverPage = "";
$url = parse_url($_SERVER['REQUEST_URI']);


$remoteFunction = end(split('/', $url['path']));

$arrmsg = array();
foreach($_GET as $k=>$value){
	if(intval($value))
        	 $tmp = "int";
    	else
        	$tmp = "string";
   	 $arrmsg[] = new xmlrpcval($value, $tmp);
}

$msg = new xmlrpcmsg($remoteFunction, $arrmsg);
$c = new xmlrpc_client($serverPage, $serverAddress, $serverPort); 

$r = $c->send($msg);

if (!$r->faultCode()) {
    if($r->value()->kindOf() == 'scalar')
        print $r->value()->scalarVal();
}else{
	print $r->faultCode();
}


?>
