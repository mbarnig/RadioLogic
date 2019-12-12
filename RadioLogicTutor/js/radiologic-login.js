// version 0.9 build 15

function toggleLogin() {
	var link = $( "#main").find( "li a").eq( 0 );
	var linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#login").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#about").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#settings").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#cases").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#observations").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	/*
	link = $( "#images").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	*/
	link = $( "#diagnosis").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#answer").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#results").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	link = $( "#help").find( "li a").eq( 0 );
	linkText = link.text().replace("Login", "Logout");
	link.text( linkText);
	// change content in panel
	$("#userlogout").css("display", "block");
	$("#userlogin").css("display", "none");
	// change text and state of diagnoseButton
	diagnoseButtonText = "Submit your choice";
	if(document.getElementById("diagnoseButton") != undefined) {
		if(!diagnosisSubmitted){
			$('#diagnoseButton').text(diagnoseButtonText);
			$('#diagnoseButton').button('enable');
		}
	}
	
}
		
function toggleLogout() {
	var link = $( "#main" ).find( "li a" ).eq( 0 );
	var linkText = link.text().replace("Logout", "Login");
	link.text( linkText );		
	link = $( "#login" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#about" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#settings" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#cases" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#observations" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	/*
	link = $( "#images" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	*/
	link = $( "#diagnosis" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#answer" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#results" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	link = $( "#help" ).find( "li a" ).eq( 0 );
	linkText = link.text().replace("Logout", "Login");
	link.text( linkText );
	// change content in panel
	$("#userlogout").css("display", "none");
	$("#userlogin").css("display", "block");
	// change text and state of diagnoseButton
	diagnoseButtonText = "Please login to submit your choice";
	if(document.getElementById("diagnoseButton") != undefined) {
		if(!diagnosisSubmitted){
			$('#diagnoseButton').text(diagnoseButtonText);
			$('#diagnoseButton').button('disable');
		}
	}
}

function signin() {
	// get name and password
	var loginName = $("#myusername").val();
	var loginPassword = $("#mypassword").val();
	debugLog("loginName : " + loginName + " ; loginPassword : " + loginPassword);
	// check if radiobutton = "newuser" or "reguser" ?
	var checkedradio = $('[name="usersignin"]:radio:checked').val();
	if (checkedradio == "new") {
		userLoggedIn = newUser(loginName, loginPassword);
	} else {
		userLoggedIn = regUser(loginName, loginPassword);
	}  // end if-else
	if (userLoggedIn) {
		enableResults();
		toggleLogin();
		$( ":mobile-pagecontainer" ).pagecontainer("change", "#results");	
	}  // end if userLoggedIn
}  // end signin
				
function logout() {
	userLoggedIn = false;
	disableResults();
	toggleLogout();
	resetGlobalVariables();
	// clear login fields
	$("#myusername").val("");
	$("#mypassword").val("");
	// ????? why is this code used ?????
	document.getElementById("myresets").innerHTML = "<p>The number of resets is registrated in your local user account.</p>";
	// check if user was logged in as admin
	if(userIsAdmin) {
		disableAdmin();
	}
	userID = -1;
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}  // end logout
					
function quit() {
	if (userIsAdmin) {
		// disable admin buttons
		disableAdmin();
	}
	userLoggedIn = false; 
	disableResults();
	toggleLogout();
	resetGlobalVariables();
	// close browser window if possible
	// prevent user to use back button in browser
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#quit");
}  // end quit
		
function newUser(name, password) {
	// check if userList Object exist already in localStorage
	var nameExist = false; 
	var temp = localStorage.getObj("userList");
	if (!temp) {
		temp = initUserObject();
	}  // end if !temp
	if (temp) {
	// check if the user number limit is not exceeded
		if (temp.length > userLimit) {
			alert("The user number limit is exceeded ! Contact your administrator");
			$("#myusername").val("");
			$("#mypassword").val("");
			} else  {
				// check if name is not admin
				if (name == "admin") {
					alert("admin is a reserved name. Please chose another user name !");
					$("#myusername").val("");
					$("#mypassword").val("");
					} else {
						// check if name length and password length are inside boundaries
						if (name.length < 3 || name.length > 18 || password.length < 3 || password.length > 18) {
							alert("Please enter a name and a password with at least 3 characters and with a maximum of 18 characters !");
							$("#myusername").val("");
							$("#mypassword").val("");
							}  else {
								for (i = 0; i < temp.length; i++) {  // admin is userList[0] = temp[0]
								// alert(temp[i].userName);
									if (name == temp[i].userName) {
										alert("Chose another name, this name is already registrated !");
										$("#myusername").val("");
										$("#mypassword").val("");
										nameExist = true;
										break;
									}  // end nameExist	
								}  // end for
								if (!nameExist) {
									// save name and password
									userID = i;
									debugLog("UserID = " + userID);
									userObject.userName = name;
									userObject.userPassword = password;
									temp.push(userObject);
									// restore pushed userList
									localStorage.setObj("userList", temp);
									userLoggedIn = true;	
									} else {
										// clear form fields
									debugLog("add action");
								}  // end if-else nameExist
							}  // end if-else admin
						} // end if-else length
					}  // end if-else user limit
				}  // end if temp
			return userLoggedIn;
}  // end newUser
			 
function regUser(name, password) {
// check if userList Object exist already in localStorage
	var temp = localStorage.getObj("userList");
	if (!temp) {
		temp = initUserObject();
	}  // end if !temp
	if (temp) {
		// check first if user or password fields are not empty
		// lint warning: comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==)
		if(name === "" || password === "") {
			alert("Please enter your name and password");
		} else {
		// check first if user is administrator and password is correct
			if (name == "admin" && password == "admin") {
				alert("You are logged in as administrator");
				enableAdmin();
			} else {
			// check if user is registrated
				for (i = 0; i <temp.length; i++) {
					if (name == temp[i].userName) {
						var userOK = true;
						break;
					}  // end userOK
				} // end for	
				// check password of registrated user
					if (userOK) {
						if (password == temp[i].userPassword) {
						// login is OK
							userLoggedIn = true;
							userID = i;
							customize();
						} else {
							alert("Your password does not correspond to your username !");
							$("#mypassword").val("");
						}  // end if-else password
							} else {
								alert("This username is not registrated !");
								$("#myusername").val("");
								$("#mypassword").val("");
							} // end if-else userOK
						}  // end if-else admin
					} // end if-else empty
				}  // end if temp
	return userLoggedIn;
}  // end regUser
		
function enableAdmin() {
	userIsAdmin = true;
	userID = 0;
	toggleLogin();
	// make admin settings visible
	document.getElementById("admin").style.display = "block";
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}	
			
function disableAdmin() {
	userIsAdmin = false;
	userID = -1;
	// hide admin settings
	document.getElementById("admin").style.display = "none";
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}

function initUserObject() {
	userList[0] = userObject;
	localStorage.setObj("userList", userList);
	// update temp
	var temp = localStorage.getObj("userList");
	return temp;
}  // end initUserObject

function customize() {
	// read and set preferences of returning user
	var temp = localStorage.getObj("userList");	
	var mysettings = temp[userID];
	// serverURLprefix
	serverURLprefix = mysettings.serverLocation;
	// iosBouncing
	iosBouncing = mysettings.iosBouncing;
	// pixelRep
	pixelRep = mysettings.pixelRep;  
	// resets
	myResets = mysettings.userResets;
	document.getElementById("myresets").innerHTML = "<p>The number of resets is registrated in your local user account. Current value : " + myResets + "</p>";
	debugLog("Customizations");
	debugLog(serverURLprefix);
	debugLog(iosBouncing);
	debugLog(pixelRep);
	debugLog(myResets);
}

function resetGlobalVariables() {
	serverURLprefix = "http://www.radiologic.fr/dicom/"; // default
	iosBouncing = true;  // default
	pixelRep = false;  // default
}
		

			 
			 