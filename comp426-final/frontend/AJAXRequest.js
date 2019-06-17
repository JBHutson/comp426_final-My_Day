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
 * @version 2017-12-10
 *
 * General Notes:
 *
 */

/**
  * Default error handler for AJAX requests
  * @param xhr xhr information from the library */
var failedRequest = function(xhr) {

	console.log(xhr);
};

/**
 * Method to automate AJAX requests
 * @param requestType String description of the request (POST, GET, etc.)
 * @param target URI to access (i.e. auth, validate_session)
 * @param data JSON data to use in the request
 * @param success Callback when the request is completed
 * @param error Default error function if left blank, otherwise define a handler */
var AJAXRequest = function(requestType, target, data, success, error = failedRequest) {

	console.log('DEBUG: Making ' + requestType + ' to /' + target);

	$.ajax({
		type: requestType,
		url: 'https://app.andersentech.net:5001/' + target,
		data: data,
		dataType: 'json',
		encode: true,
		error: error,
	}).done(success);
};

var getUsername = function(target) {

	if (Cookies.get('auth')) {

		AJAXRequest('POST', 'validate_session', {'encryptedSession' : Cookies.get('auth')}, function(data, status, xhr) {

			if (xhr.status == 200) {

				target(data);
			}
		}, function(xhr) {

			$(location).attr('href', 'https://app.andersentech.net/login.html');
		});
	}
	else {

		$(location).attr('href', 'https://app.andersentech.net/login.html');
	}
};