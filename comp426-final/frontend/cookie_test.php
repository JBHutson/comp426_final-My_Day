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

	/* Import the RESTful framework */
	include("RESTful.php");

	if (isset($_COOKIE['auth'])) {

		$res = CallAPI('POST', 'https://app.andersentech.net:5001/validate_session',
			array("encryptedSession" => $_COOKIE['auth']));

		if ($res == -1) {

			header("Location: https://app.andersentech.net/login.html");
		}
		else {

			echo("Login successful");
		}
	}
	else {

		header("Location: https://app.andersentech.net/login.html");
		die();
	}
?>