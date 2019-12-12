// version 0.9 build 18

function showAnswer() {
	var element = document.getElementById("answerpanel");
	cornerstone.enable(element);
	cornerstone.displayImage(element, answerImage);
	// });
}  // end showAnswer

function showChoices() {
  // lint warning: comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==)
  if (loadedQuestion === false) {
	loadedQuestion = true;
	// clear diagnosispanel
	document.getElementById("diagnosispanel").innerHTML = "";
    var dataSet = dicomParser.parseDicom(observationImages[caseToLoad].data.byteArray);
    // get questions
    var answerchoices = "";
    answerchoices = "<form>";
    answerchoices += "<fieldset data-role='controlgroup'>";
    answerchoices += "<legend>Your Diagnosis :</legend>";
	var i = 0;
	
	while (dataSet.stringUTF8("x4321101" + i) !== undefined) {
		
		
		answerchoices += "<input type='radio' name='answer' id='b" + i + "' value='Button0" + (i + 1) + "'>";
		
		answerchoices += "<label for='b" + i + "'>" + dataSet.stringUTF8('x4321101' + i) + "</label>";
		
		i++;
	}  // end while
	answerchoices += "</fieldset>";
    answerchoices += "</form>";
	// check if user is logged in
	answerchoices += "<button id='diagnoseButton' class='ui-btn ui-btn-inline' onclick='diagnose()'>" + diagnoseButtonText + "</button>";
	$("#diagnosispanel").append(answerchoices);
	$('input[type=radio]').checkboxradio().trigger('create');
	$("#diagnoseButton").button();
	// check if user is logged in
	if (userLoggedIn) {
	$('#diagnoseButton').button('enable');
	} else {
	$('#diagnoseButton').button('disable');
	}

	// load answer file
	if (serverURLprefix.substring(0,10) == "http://www") {
		// public archive
		loadAnswerFileFromPublicArchive();
	} else {
		// private archive
		loadAnswerFileFromPrivateArchive();
	};  // end if-else
 }  // end if
 
 function loadAnswerFileFromPublicArchive() {
	var folder = caseToLoad.toLowerCase();
	var imageId = "wadouri:" + serverURLprefix + folder + "/" + caseToLoad + "-answer.dcm";
	cornerstone.loadImage(imageId).then(function(image) {
	answerImage = image;
	var dataSet = dicomParser.parseDicom(image.data.byteArray);
	// get correct answer
	correctAnswer = dataSet.string("x43211020");
	console.log(correctAnswer);
	}, function(err) {
	alert(err);
	}); 
 }  // end function
 
 function loadAnswerFileFromPrivateArchive() {
	cornerstone.loadImage(answerImageId).then(function(image) {
	answerImage = image;
	var dataSet = dicomParser.parseDicom(image.data.byteArray);
	// get correct answer
	correctAnswer = dataSet.string("x43211020");
	}, function(err) {
	alert(err);
	}); 
 }  // end function
	
// enable "Diagnosis button" only if user is logged in
// show text on diagnosis button to login if not
// disable "Diagnosis button" if diagnosis has been submitted
// show alert box if answer is correct or false
	
	
}  // end showChoices

function diagnose() {
	// read selected choice
	var myanswer = "";
	var selectedChoice = $('[name="answer"]:radio:checked').val();
	console.log("selectedChoice : " + selectedChoice);
	if (selectedChoice == undefined) {
		alert("Please push a radio button to define your choice !");
	} else {
		myanswer = selectedChoice;
		if (myanswer == correctAnswer) {
			changeCaseStatus("correct");
			alert("Congratulations!\nYour diagnose is correct.\nView the details on the next page.");
		} else {
			changeCaseStatus("wrong");
			alert("Sorry!\nYour answer is wrong.\nView the correct diagnosis on the next page.");
		}
		diagnosisSubmitted = true;
		diagnoseButtonText = "This diagnosis has been submitted";
		if(document.getElementById("diagnoseButton") != undefined) {
		$('#diagnoseButton').text(diagnoseButtonText);
		$('#diagnoseButton').button('disable');
		}
		enableAnswer();
		$( ":mobile-pagecontainer" ).pagecontainer("change", "#answer");
	}  // end if
}  // end diagnose

function changeCaseStatus(status) {
	// update case status in assessment
	var jump = false;
	var temp = localStorage.getObj("userList");
	var sessionNumber = temp[userID].assessment.sessions.length;
	for (j=0; j<sessionNumber; j++) {
		if(temp[userID].assessment.sessions[j].name == currentSession) {
			var caseNumber = temp[userID].assessment.sessions[j].cases.length;
			for (i=0; i<caseNumber; i++) {
				if (temp[userID].assessment.sessions[j].cases[i].name == caseToLoad) {
					temp[userID].assessment.sessions[j].cases[i].status = status;
					localStorage.setObj("userList", temp);
					jump = true;
					break; // jump out from i Loop
				}  // end if case
			}  // end for i Loop
		}  // end if session
		if(jump) {
			break; // jump out from j Loop
		}
	} // end for j Loop
}