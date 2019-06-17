<?php
	/*  ______   ______   ___ __ __   ______   __   __      _____    ______      
	 * /_____/\ /_____/\ /__//_//_/\ /_____/\ /__/\/__/\   /_____/\ /_____/\     
	 * \:::__\/ \:::_ \ \\::\| \| \ \\:::_ \ \\  \ \: \ \__\:::_:\ \\:::__\/     
	 *  \:\ \  __\:\ \ \ \\:.      \ \\:(_) \ \\::\_\::\/_/\   _\:\| \:\ \____   
	 *   \:\ \/_/\\:\ \ \ \\:.\-/\  \ \\: ___\/ \_:::   __\/  /::_/__ \::__::/\  
	 *    \:\_\ \ \\:\_\ \ \\. \  \  \ \\ \ \        \::\ \   \:\____/\\:\_\:\ \ 
	 *     \_____\/ \_____\/ \__\/ \__\/ \_\/         \__\/    \_____\/ \_____\/ 
	 *
	 * Project: COMP426 Final Project
	 * @author Samuel Andersen
	 * @version 2017-12-09
	 *
	 * General Notes:
	 *
	 */

	/**
	  * Function to make calls to a RESTful API
	  * Taken from: https://stackoverflow.com/questions/9802788/call-a-rest-api-in-php
	  * Modified for COMP426
	  * @param $method Type of HTTP request to make (POST, GET, etc.)
	  * @param $url Target URL
	  * @param $data Any JSON data we want to post (array("param" => "value")) */
	function CallAPI($method, $url, $data = false) {
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_VERBOSE, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($curl, CURLOPT_CAINFO, "/home/ubuntu/comp426-final/certs/app.andersentech.net.pem");

		switch ($method) {
			case "POST":
				curl_setopt($curl, CURLOPT_POST, 1);

				if ($data)
					curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
				break;
			case "PUT":
				curl_setopt($curl, CURLOPT_PUT, 1);
				break;
			default:
				if ($data)
					$url = sprintf("%s?%s", $url, http_build_query($data));
		}

		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

		$result = curl_exec($curl);

		curl_close($curl);

		return $result;
	}
?>