<?php
//print_r($_REQUEST);
$amount = $_REQUEST['amount'];
$currency = $_REQUEST['currency'];

function request($amount, $currency) {
	$url = "https://test.oppwa.com/v1/checkouts";
	$data = "authentication.userId=8a8294174b7ecb28014b9699220015cc" .
		"&authentication.password=sy6KJsT8" .
		"&authentication.entityId=8a8294174b7ecb28014b9699220015ca" .
		"&amount=".$amount.
		"&currency=".$currency.
		"&paymentType=PA";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
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
echo $responseData = request($amount, $currency);
?>