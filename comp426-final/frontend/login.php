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

	/* Set appropriate response type */
	header("Content-Type:application/json");

	/* Get the method requested */
	$method = $_SERVER['REQUEST_METHOD'];
	$uri_info = parse_url($_SERVER['REQUEST_URI']);

	
	if ($method == 'POST') {

		$username = $_POST['uname'];
		$password = $_POST['psw'];

		$target = array();
		$target['username'] = $username;
		$target['password'] = $password;

		$res = CallAPI("POST", "https://app.andersentech.net:5001/auth", $target);

		if ($res == "ERROR: Invalid request received" || $res == "ERROR: Unable to authenticate user") {

			header("Location: https://app.andersentech.net/login.html");
			die();
		}

		if (isset($_COOKIE['auth'])) {

			echo($_COOKIE['auth']);
		}

		setcookie('auth', $res, 0, '/');
		header("Location: https://app.andersentech.net/cookie_test.php");
		die();
	}

	header("Location: https://app.andersentech.net/login.html");
	die();
?>