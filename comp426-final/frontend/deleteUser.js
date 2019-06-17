$(document).ready(function() {

$('#deleteUserForm').submit(function(event){
	
	var formData = {
	
		'username': $('input[name=uname]').val(),
		'password': $('input[name=psw]').val()
	};
	
	AJAXRequest('DELETE', 'delete_user', formData, deletedUser);
	
	
});

var deletedUser = function() {
	window.alert("User deleted");
};
});