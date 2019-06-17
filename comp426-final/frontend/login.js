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

 /* Based on: https://scotch.io/tutorials/submitting-ajax-forms-with-jquery */

 $(document).ready(function() {

 	var checkAuthResult = function(data, status, xhr) {

 		if (xhr.status == 200) {

 			Cookies.set('auth', data);
 			$(location).attr('href', 'https://app.andersentech.net/login.html');
 		}
 	};

 	/* Get ready to process the form */
 	$('#loginForm').submit(function(event) {

 		var formData = {

 			'username': $('input[name=uname]').val(),
 			'password': $('input[name=psw]').val()
 		};

 		AJAXRequest('POST', 'auth', formData, checkAuthResult);

 		event.preventDefault();
 	});

 	if (Cookies.get('auth')) {

 		var currentSession = Cookies.get('auth');

 		AJAXRequest('POST', 'validate_session', {'encryptedSession': currentSession},
 			function(data, status, xhr) {

 				if (xhr.status == 200) {

 					$(location).attr('href', 'https://app.andersentech.net/myday.html');
 				}
 			}, function(xhr) {

 				console.log(xhr.status);
 			});
 	}
 });