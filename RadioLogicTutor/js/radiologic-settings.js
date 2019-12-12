// version 0.9 build 15

function updateRadioButtons() {
	// set current values
	// serverLocation
	if(serverURLprefix == "http://www.radiologic.fr/dicom/") {
		$('#publicserver').prop('checked', true).checkboxradio('refresh');
		$('#orthancmac').prop('checked', false).checkboxradio('refresh');
	} else {
		$('#publicserver').prop('checked', false).checkboxradio('refresh');
		$('#orthancmac').prop('checked', true).checkboxradio('refresh');	
	}
	// systemPreferences
	$('#iosbouncing').prop('checked', iosBouncing).checkboxradio('refresh');
	$('#pixelrep').prop('checked', pixelRep).checkboxradio('refresh');
}

function applyServerSettings() {
	var checkedradio = $('[name="serversettings"]:radio:checked').val();
	switch(checkedradio) {
		case "publicserver" :
		serverURLprefix = "http://www.radiologic.fr/dicom/";
		break;
		case "orthancmac" :
		serverURLprefix = "http://orthancmac";
		break;
		case "orthancpi" :
		serverURLprefix = "http://orthancpi";
		default :
		break;
	} // end switch 
	$("#server").collapsible("collapse");
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
	return serverURLprefix;
}  // end applyServerSettings

function saveServerSettings() {
	var serverURLprefix = applyServerSettings();
	if(userLoggedIn) {
	var temp = localStorage.getObj("userList");	
	temp[userID].serverLocation = serverURLprefix;
	localStorage.setObj("userList", temp);
	} else {
		alert("You must login to save the server settings !");
	}
}

function manageUsers() {
	var checkedradio = $('[name="useradmin"]:radio:checked').val();
	// debugLog(checkedradio);
	switch(checkedradio) {
		case "show" :
		// show users
		showUsers();
		break;
		case "del" :
		// delete user with name
		deleteUser();
		break;
		case "delall" :
		// delete all users
		deleteAllUsers();
		break;
		default :
		break;	
	}  // end switch
}  // end manageUsers
		
function showUsers() {
	// show all users
	var temp = localStorage.getObj("userList");
	var userName = [];
	var userPassword = [];
	if (temp) {   // admin is userList[0]
		var listusers = "<p>The names of the registrated users are listed below :<br/>";
		for (i = 0; i < temp.length; i++) {
			userName[i] = temp[i]. userName;
			listusers += i + " :  " + userName[i] + "<br/>";
		}  // end for
		listusers += "</p>";
		$("#displayusers").html(listusers);
		$('#admin').collapsible("expand");
	}  // end if temp
}
		
function deleteUser() {
	var userExist = false;
	var temp = localStorage.getObj("userList");
	var userName = [];
	var delName = $("#userdel").val();
	if (temp) {   // admin is userList[0]
		if(delName == "admin") {
			alert("You can't delete user admin !");
		} else {
			for (i = 1; i < temp.length; i++) {
				userName[i] = temp[i]. userName;
				if (userName[i] == delName) {
					// remove name from userlist
					temp.splice(i,1);
					localStorage.setObj("userList", temp);
					userExist=true;
					// clear search field
					$("#userdel").val("");
					showUsers();
					break;
				}
			} // end for
			if(!userExist) {
			// name was not found
				alert("This name doesn't exist in the user list");
			}
		}  // end-if admin
	}  // end-if temp
}
		
function deleteAllUsers() {
	var temp = localStorage.getObj("userList");
	 if(temp) {
		 // clear admin account
		 // ????? why this clearing   ??????
		 temp[0].diagnosesSubmitted = "";
		 temp[0].casesPending = "";
		 temp[0].diagnosesCorrect = "";
		 temp[0].sessionsCompleted = "";
		 temp[0].sessionsPending = "";
		 temp[0].sessionsCorrect = "";
		 // delete other users
		temp.splice(1, (temp.length - 1));
		localStorage.setObj("userList", temp);
	}
	$("#displayusers").html("");
	$("#admin").collapsible("collapse");
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}
		
function userReset() {
	if(userLoggedIn) {
		var temp = localStorage.getObj("userList");	
		// increment userResets 
		// lint warning: increment (++) and decrement (--) operators used as part of greater statement
		var resets = temp[userID].userResets;
		resets++;
		temp[userID].assessment = {sessions:[{name:"",cases:[{name:"",status:""}]}]};
		localStorage.setObj("userList", temp);
		document.getElementById("myresets").innerHTML = "<p>The number of resets is registrated in your local user account. Current value : " + (resets+1) + "</p>";
	} else {
		alert("You must login to reset your account !");
	}
	$("#reset").collapsible("collapse");
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}
		
function applySystemSettings() {
	if($("#iosbouncing").is(":checked"))  {
		iosBouncing = true;
		// enable noBounce on iOS
		iNoBounce.enable();
	} else {
		iosBouncing = false;
		// disable noBounce on iOS
		iNoBounce.disable();
	}
	if($("#pixelrep").is(":checked"))  {
		pixelRep = true;
	} else {
		pixelRep = false;
	}
	$("#system").collapsible("collapse");
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}
		
function saveSystemSettings() {
	applySystemSettings();
	if(userLoggedIn) {
		var temp = localStorage.getObj("userList");	
		temp[userID].iosBouncing = iosBouncing;
		temp[userID].pixelRep = pixelRep;
		localStorage.setObj("userList", temp);
		} else {
			alert("You must login to save the system settings !");
	}
}
		

		