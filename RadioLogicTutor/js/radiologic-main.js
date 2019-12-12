// version 0.9 build 15
"use strict";

// global variables
var userList = [];
var userID = -1;
var userLimit = 9;
var serverURLprefix = "http://www.radiologic.fr/dicom/";
var userLoggedIn = false;
var currentSession = "";  // add Session Name in session file, add Session Description in all_session file
var caseToLoad = "";
var casesInSession = 0;
var info = true;
var draggedElement = {};
		
// define global user object
var userObject = {
	userName: "admin",  // string
	userPassword: "admin",  // string
	iosBouncing: false,  // boolean,
	pixelRep: false, // boolean,
	serverLocation: serverURLprefix,  //string
	userResets: 0,  // integer
	assessment:{
		sessions:[{
		name:"",
		caseNumber:0,
			cases:[{
				name:"",
				status:""
			}]
		}]
	}
};

var viewports = {
	viewPanelLeftTop : {},
	viewPanelLeftTopIndex : 0,
	viewPanelLeftBottom : {},
	viewPanelLeftBottomIndex : 0,
	viewPanelRightTop : {},
	viewPanelRightTopIndex : 0,
	viewPanelRightBottom : {},
	viewPanelRightBottomIndex : 0
}

// enable noBounce on iOS
var iosBouncing = true;  // default
iNoBounce.enable();

var deviceOrientation = "landscape";
var dicomThumbContainerVerticalLength = "100%";
var dicomThumbContainerHorizontalLength = "100%";
var dicomThumbContainerVerticalWidth = "86px";
var dicomThumbContainerHorizontalHeight = "120px";

var pixelRep = false;  // default
var myResets = 0;

var mycasepath = "";
var mycasefile = "";
var myImageIds = [];

var observationImages = [];
var answerImage = {}; 
var external = true;

var caseArray = [];

var loadedImageNumber = 0;
var seriesNumber = 0;
var firstView = true;
var answerImageId = "";


//public server WADO
var urlPrefix = "http://www.radiologic.fr/dicom/";
var imageIdPrefix = "wadouri:http://www.radiologic.fr/dicom/";
// private OrthancPi server : "wadouri:http://orthancpi:8043/dicom/"
// private OrthancMac server : "wadouri:http://orthancmac:8043/dicom/"
// private OrthancSyno server : "wadouri:http://www.barnig.net:8043/dicom/"

var loadedQuestion = false;
var correctAnswer = "";
var diagnoseButtonText = "Please login to submit your choice";	

function debugLog(debugMessage){
	// comment the next line to disable logging
	// console.log(debugMessage);
}

function updateFooter(newMessage) {
	var elements = document.getElementsByClassName("rlFooter");
	// console.log("Footer elements : " + elements);
	for (var j=0; j<elements.length; j++){
		// console.log(elements[j]);
		elements[j].style.textAlign = "left";
		elements[j].innerHTML = newMessage;
	}  // end for j
}

function resetFooter() {
	var elements = document.getElementsByClassName("rlFooter");
	// console.log("Footer elements : " + elements);
	for (var j=0; j<elements.length; j++){
		// console.log(elements[j]);
		elements[j].style.textAlign = "center";
		elements[j].innerHTML = "Radiologic &copy; 2016";
	}  // end for j
}

function statusInFooter() {
	// show user, server, session, clinical case and system info in 'About' and 'Help' Footer
	var statusInfos = " User: Marco; Server: OrthancPi; Session: MSK-1; Case: MSK_P1_C1; Bouncing: on";
	var element = document.getElementById("help");
	var item = element.getElementsByClassName("rlFooter");
	item[0].style.textAlign = "right";
	item[0].innerHTML = statusInfos;
	element = document.getElementById("about");
	item = element.getElementsByClassName("rlFooter");
	item[0].style.textAlign = "right";
	item[0].innerHTML = statusInfos;
}

$(document).on("pagecontainerbeforeshow", function (e, ui) {
	if (clinicalCaseLoaded) {enableQuiz();}
	if (userLoggedIn && diagnosisSubmitted) {enableAnswer();}
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
	switch(activePage) {
	case "main" :
	// do something
	break;
	case "login" :
	// clear input text fields
	// $("#myusername").val("");
	// $("#mypassword").val("");
	break;
	case "about" :
	// do something
	break;
	case "settings" :
	// do something
	break;
	case "cases" :
	// close all collapsibles
	// $(".cliniccases").collapsible("collapse");
	break;
	case "observations" :
	// do something
	break;
	case "images" :
	// do something
	// set footer border only on this page
	//  border: 1px solid silver !important;
	break;
	case "diagnosis" :
	// do something
	break;
	case "answer" :
	// do something
	break;
	case "results" :
	// do something
	break;
	case "help" :
	// do something
	default :
	break;
	}
});

$(document).on("pagecontainershow", function (e, ui) {
	contentHeight();
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
			switch(activePage) {
				case "settings" :
				updateRadioButtons();
				break;
				case "cases" :
				showSessions();
				break;
				case "observations" :
				showObservation();
				break ;
				case "images" :
				manageViewports();
				break;
				case "diagnosis" :
				showChoices();
				break;
				case "answer" :
				showAnswer();
				break;
				case "results" :
				showResults();
				break;
				case "help" :
				showHelp();
				break;
				default :
				// do nothing
				break;
			}
});

$(window).on("throttledresize", function (event) {
	contentHeight();
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
	if(activePage == "observations") {
		var element = document.getElementById("observationspanel");
		// cornerstone.fitToWindow(element);
	}
});

// get the height of the image containers; 
// without this function the content height is not set to 100%
function contentHeight() {
	// http://stackoverflow.com/questions/15485735/use-of-commas-versus-semicolons-in-javascript
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage"),
	screen = $.mobile.getScreenHeight(),
	header = $(".ui-header", activePage).hasClass("ui-header-fixed") ? $(".ui-header", activePage).outerHeight() - 1 : $(".ui-header", activePage).outerHeight(),
	footer = $(".ui-footer", activePage).hasClass("ui-footer-fixed") ? $(".ui-footer", activePage).outerHeight() - 1 : $(".ui-footer", activePage).outerHeight(),
	contentCurrent = $(".ui-content", activePage).outerHeight() - $(".ui-content", activePage).height(),
	content = screen - header - footer - contentCurrent;
	/* apply result */
	$(".ui-content", activePage).height(content);
}

function enableQuiz() {
	$("#main li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");  // Menu Observation
	$("#login li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#about li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#settings li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#cases li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#results li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#help li:nth-child(5)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#main li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");  // Menu Diagnosis
	$("#login li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#about li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#settings li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#cases li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#results li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#help li:nth-child(7)").removeClass("ui-disabled").addClass("ui-enabled");
}

function enableImageMenu() {
	$("#main li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");  // Menu Images
	$("#login li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#about li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#settings li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#cases li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#observations li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#diagnosis li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#answers li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#results li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#help li:nth-child(6)").removeClass("ui-disabled").addClass("ui-enabled");
}

function disableImageMenu() {
	$("#main li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#login li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#about li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#settings li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#cases li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#observations li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#diagnosis li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#answers li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#results li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#help li:nth-child(6)").removeClass("ui-enabled").addClass("ui-disabled");
}

function cancel() {
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}

$(window).on("orientationchange", function (event) {
	contentHeight();
	if (event.orientation == "landscape") {
		deviceOrientation = "landscape";
	} else {
	deviceOrientation = "portrait";
	}  // end if-else event.orientation
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
	switch(activePage) {
		case "observations" :
		var element = document.getElementById("observationspanel");
		// second parameter "true" to fit to window
		cornerstone.resize(element, true);
		break;
		case "answer" :
		var element = document.getElementById("answerpanel");
		// second parameter "true" to fit to window
		cornerstone.resize(element, true);
		break;
		case "images" :
		if(deviceOrientation == "landscape"){
			landscapeLayoutImages();
		} else {
			portraitLayoutImages();
		}
		break;
		case "results" :
		if(deviceOrientation == "landscape"){
			landscapeLayoutResults();
		} else {
			portraitLayoutResults();
		}
		break;
		default:
		// do nothing
		break;
	}  // end switch
	
});

$(document).ready(function() {
	var element = document.getElementById('imagescontent');
	hammerManager = new Hammer.Manager(element); // global object
	hammerManager.set({enable:false});
	$('#viewPanelLeftTop').on("CornerstoneImageRendered", leftTopImageRendered); 
	$('#viewPanelLeftBottom').on("CornerstoneImageRendered", leftBottomImageRendered); 
	$('#viewPanelRightTop').on("CornerstoneImageRendered", rightTopImageRendered); 
	$('#viewPanelRightBottom').on("CornerstoneImageRendered", rightBottomImageRendered); 
});





