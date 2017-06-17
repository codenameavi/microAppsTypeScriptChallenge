<?php
//print_r($_REQUEST);
$resourcePath = $_REQUEST['resourcePath'];	// '/v1/checkouts/40C4774CB7017E5DDDE4FDC94098A050.sbg-vm-tx01/payment'

function request($resourcePath='') {
	$url = "https://test.oppwa.com/".$resourcePath;
	$url .= "?authentication.userId=8a8294174b7ecb28014b9699220015cc";
	$url .= "&authentication.password=sy6KJsT8";
	$url .= "&authentication.entityId=8a8294174b7ecb28014b9699220015ca";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$responseData = curl_exec($ch);
	if(curl_errno($ch)) {
		return curl_error($ch);
	}
	curl_close($ch);
	return $responseData;
}

header('Content-type:application/json;charset=utf-8');
echo $responseData = request($resourcePath);
?>