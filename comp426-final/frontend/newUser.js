$(document).ready(function() {

$('#newUserForm').submit(function(event){
	
	var formData = {
	
		'username': $('input[name=uname]').val(),
		'password': $('input[name=psw]').val()
	};
	
	AJAXRequest('POST', 'add_user', formData, newUserAdded);
	
	event.preventDefault();
	
	
});

var newUserAdded = function() {
	window.alert("New User Added");
};
});
