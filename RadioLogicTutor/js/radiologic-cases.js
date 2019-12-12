// version 0.9 build 19

function showSessions() {
	if (serverURLprefix.substring(0,10) == "http://www") {
		// public archive
		showSessionsFromPublicArchive();
	} else {
		// private archive
		showSessionsFromPrivateArchive();
	};  // end if-else
}  // end showSessions

function showSessionsFromPublicArchive() {
	var tempPath = serverURLprefix + "sessions/radiologic_all_sessions.json";
	var showData = $("#show-data");
	var promise = $.getJSON(tempPath);
	promise.done(function(data, status) {
		var output = "";
		for (var i in data.sessionList) {
			output+= '<option value="' + data.sessionList[i].file + '">' + data.sessionList[i].sessionDescription + '</option>';
		}  // end-for		
	document.getElementById("select-session").innerHTML=output;	
	$('#sessionbutton').button("enable");
	$("#select-session").selectmenu("refresh");
	});
	promise.fail(function() {
		promiseError();
	});
	promise.always(function() {
		//do nothing
	});
}  // end showSessions

function showSessionsFromPrivateArchive() {
	// clear promiseList
	promiseList = [];
	createPrivateSessionTree();
}  // end showSessionsFromPrivateArchive

function loadSession() {
	if (serverURLprefix.substring(0,10) == "http://www") {
		// public archive
		loadSessionFromPublicArchive();
	} else {
		// private archive
		loadSessionFromPrivateArchive();
	};  // end if-else
} // end loadSession
	
function loadSessionFromPublicArchive() {
var session = $("#select-session").val();
mycasepath = serverURLprefix + "sessions/" + session;
$("#casebox").css("display", "block");
	var promise = $.getJSON(mycasepath);
	promise.done(function(data, status) {
	currentSession = data.sessionName;	
	var output = "";
	document.getElementById("caselist").innerHTML="";
	casesInSession = data.caseList.length;
	// alert(casesInSession);
	for (var i in data.caseList) {
		var currentCase = data.caseList[i].ccase;
		output = '<li><a href="#" onclick="loadCaseFromPublicArchive(' + i + ')"><div id="thumb' + i + '" class="thumbContainer"></div><h2>' + data.caseList[i].ccase + ' : <span id="desc' + i + '">Description</span></h2><span class="ui-li-count">Instances : ' + data.caseList[i].images + '</span></a> </li>';
		$("#caselist").append(output);
		var folder = currentCase.toLowerCase();
		var url = serverURLprefix + folder + "/" + currentCase + "-observation.dcm";
		loadCaseInfoFromObservationFile(currentCase, url, i);
	}  // end for 	
	$("#caselist" ).listview("refresh");
	});
	promise.fail(function() {
		promiseError();;
	});
	promise.always(function() {
		//do nothing
	});
}

function loadSessionFromPrivateArchive() {
	$("#casebox").css("display", "block");
	// list casenames
	var casesName = dicomTree._root.children;
	document.getElementById("caselist").innerHTML = "";
	for (i in casesName) {
		var caseName = casesName[i].data;
		var caseInstancesCount = 0;
		output = '<li><a href="#" onclick="loadCaseFromPrivateArchive(' + i + ')"><div id="thumb' + i + '" class="thumbContainer"></div><h2>' + caseName + ' : <span id="desc' + i + '">Description</span></h2><span class="ui-li-count">Instances : ' + caseInstancesCount + '</span></a> </li>';
		$("#caselist").append(output);
		loadCaseInfoFromPrivateArchive(i);
	};  // end for i
	$("#caselist" ).listview("refresh");
	
}  // end loadSessionFromPrivateArchive

function loadCaseInfoFromObservationFile(clinicalCase, url, index) {
	var imageId = "wadouri:" + url;
	var element = document.getElementById("thumb" + index);
	cornerstone.enable(element);
	// options
		var viewportOptions = {
			scale: 1.0,
			translation: {
				x: 456,
				y: 296
			},
			invert:false,
			pixelReplication: false
		};
		cornerstone.loadAndCacheImage(imageId).then(function(image) {
			observationImages[clinicalCase] = image;
			cornerstone.displayImage(element, image, viewportOptions);
			var dataSet = dicomParser.parseDicom(image.data.byteArray);
			// get Patient comment
			var caseDescription = dataSet.stringUTF8("x00104000");
			var elemDesc = document.getElementById("desc" + index);
			elemDesc.innerHTML = caseDescription;
		},  function(err) {
		alert("Load Error " + err + " in function loadCaseInfoFromPublicArchive!");
	});
}  // end function

function loadCaseInfoFromPrivateArchive(index) {
	var clinicalCase = dicomTree._root.children[index].data;
	// Observation files
	var observationImageUID = dicomTree._root.children[index].children[0].children[0].data;
	var observationImageURL = serverURLprefix + ":8043/orthanc" + observationImageUID;
	var answerImageUID = dicomTree._root.children[index].children[1].children[0].data;
	answerImageId = "wadouri:" + serverURLprefix + ":8043/orthanc" + answerImageUID;
	var imageId = "wadouri:" + observationImageURL;
	var element = document.getElementById("thumb" + index);
	cornerstone.enable(element);
	// options
	var viewportOptions = {
		scale: 1.0,
		translation: {
			x: 456,
			y: 296
		},
		invert:false,
		pixelReplication: false
	};
	cornerstone.loadAndCacheImage(imageId).then(function(image) {
		observationImages[clinicalCase] = image;
		cornerstone.displayImage(element, image, viewportOptions);
		
		var dataSet = dicomParser.parseDicom(image.data.byteArray);
		// get Patient comment
		var caseDescription = dataSet.stringUTF8("x00104000");
		// replace special characters
		var elemDesc = document.getElementById("desc" + index);
		elemDesc.innerHTML = caseDescription;
	},  function(err) {
			alert("Load Error " + err + " in function loadCaseInfoFromPrivateArchive!");
	});
}  // end function

function Decodeuint8arr(uint8array) {
	return new TextDecoder("utf-8").decode (uint8array);
}

function loadCaseFromPublicArchive(index) {
	disableImageMenu();
	// the case to load is defined by the index in the session JSON file
	var promiseSession = $.getJSON(mycasepath);
	promiseSession.done(function(data, status) {
	var folder = "sessions/";
	var caseFile = data.caseList[index].file;
	console.log(caseFile);
	var caseURL = urlPrefix + folder + caseFile;
	console.log(caseURL);
	var dicomFolder = data.caseList[index].ccase.toLowerCase() + "/";
	caseToLoad = data.caseList[index].ccase;
	console.log(caseToLoad);
	// get json file of caseToLoad and parse through the seriesList
	var promiseCase = $.getJSON(caseURL);
	promiseCase.done(function(data, status) {
		console.log(data);
		// change Diagnosis Button Text
		if(userLoggedIn) {
			diagnoseButtonText = "Submit your choice";	
		} else {
			diagnoseButtonText = "Please login to submit your choice";	
		}
		if (data.seriesList != undefined) {
			seriesNumber = data.seriesList.length;
			console.log("seriesNumber : " + seriesNumber);
			updateFooter("&nbsp;&nbsp;Loading first instance of " + seriesNumber + " series as thumbnails!");
			// clear stacks
			caseArray = [];
			loadedImageNumber = 0;
			// iterate through JSON seriesList
			for(i = 0; i < seriesNumber; i++) {
				var caseSeries = {
					seriesName : "",
					seriesImageIds : [],
					seriesImageStack : [],
					seriesImageIndex : 0
				};
				caseSeries.seriesName = data.seriesList[i].seriesName;
				//console.log("seriesName : " + data.seriesList[i].seriesName);
				caseSeries.seriesImageIndex = 0;
				// clear series stack
				// iterate through JSON instanceList of one series
				var instanceNumber = data.seriesList[i].instanceList.length;
				for(j = 0; j < instanceNumber; j++){
					var imageId = "wadouri:" + urlPrefix + dicomFolder + data.seriesList[i].instanceList[j].imageId;
					//console.log("imageId : " + imageId);
					caseSeries.seriesImageIds.push(imageId);
				}  // end for j
				// load first image of each series
				loadThumbnailFromPublicArchive(caseSeries);
			} // end for i
		}  // end if data.seriesList	
	});  // end promiseCase done
	promiseCase.fail(function(error, status) {
		alert("There was an JSON error in the function LoadCaseFromPublicArchive!");
		console.log("Error1: " + error);
		console.log("Status: " + status);
	});
	promiseCase.always(function() {
		//do nothing
	});
	updateAssessment();
	clinicalCaseLoaded = true;  // ????
	loadedQuestion = false;  // ????
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#observations");
	}); // end promiseSession done 
	promiseSession.fail(function(error, status) {
		alert("There was an JSON error in the function LoadCaseFromPublicArchive!");
		console.log("Error2: " + error);
		console.log("Status: " + status);
	});
	promiseSession.always(function() {
		//do nothing
	});
}  // end loadCaseFromPublicArchive

function loadCaseFromPrivateArchive(index) {
	disableImageMenu();
	// the case to load is defined by the index in the DICOM Tree
	caseToLoad = dicomTree._root.children[index].data;
	// adjust seriesNumber by deducting observation and answer series
	seriesNumber = dicomTree._root.children[index].children.length - 2;
	updateFooter("Load " + seriesNumber + " images!");
	// clear stacks
	caseArray = [];
	// iterate through DICOM Tree without observation and answer series
	for(i = 0; i < seriesNumber; i++) {
		var caseSeries = {
			seriesName : "",
			seriesImageIds : [],
			seriesImageStack : [],
			seriesImageIndex : 0
		};
		caseSeries.seriesName = dicomTree._root.children[index].children[i+2].data;
		//console.log(caseSeries.seriesName);
		caseSeries.seriesImageIndex = 0;
		var instanceNumber = dicomTree._root.children[index].children[i+2].children.length;
		for (j = 0; j < instanceNumber; j++){
			var imageId = "wadouri:" + serverURLprefix + ":8043/orthanc" + dicomTree._root.children[index].children[i+2].children[j].data;
			caseSeries.seriesImageIds.push(imageId);
		}  // end for j
		// load first image of each series
		//console.log(caseSeries.seriesImageIds);
		loadThumbnailFromPrivateArchive(caseSeries);
	} // end for i		
	// change Diagnosis Button Text
	if(userLoggedIn) {
		diagnoseButtonText = "Submit your choice";	
	} else {
		diagnoseButtonText = "Please login to submit your choice";	
	}
	updateAssessment();
	clinicalCaseLoaded = true;  // ????
	loadedQuestion = false;  // ????
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#observations");
}  // end function

function loadThumbnailFromPublicArchive(caseSeries) {
		var firstThumbnail = caseSeries.seriesImageIds[0];
		console.log(firstThumbnail);
		if (firstThumbnail != undefined) { 
			cornerstone.loadAndCacheImage(firstThumbnail).then(function(image){
			caseSeries.seriesImageStack[0] = image;
			loadedImageNumber++;
			// test input
			// caseSeries.seriesImageIndex = loadedImageNumber;
			caseArray.push(caseSeries);
			//console.log("loadedImageNumber : " + loadedImageNumber);
			updateFooter("&nbsp;&nbsp;Please wait : " + loadedImageNumber + " thumbnails from " + seriesNumber + " are loaded!");
			if(loadedImageNumber == seriesNumber) {
				// all first images are loaded
				//console.log("CaseArray");
				//console.log(caseArray);
				firstView = true;
				updateFooter("&nbsp;&nbsp;All thumbnails are loaded.");
				enableImageMenu();
			} // end if 'all images loaded'
			}, function(err) {
			alert("Loading thumbnail error : " + err);
		});	// end image load	
	}  // end if firstThumbnail	
}  // end function

function loadThumbnailFromPrivateArchive(caseSeries) {
	var imageURL = caseSeries.seriesImageIds[0];
	cornerstone.loadAndCacheImage(imageURL).then(function(image){
		caseSeries.seriesImageStack[0] = image;
		loadedImageNumber++;
		// test input
		// caseSeries.seriesImageIndex = loadedImageNumber;
		caseArray.push(caseSeries);
		//console.log("loadedImageNumber : " + loadedImageNumber);
		updateFooter("Please wait : " + loadedImageNumber + " thumbnails from " + seriesNumber + " are loaded!");
		if(loadedImageNumber == seriesNumber) {  // without observation and answer instances
			// all first images are loaded
			//console.log("CaseArray");
			//console.log(caseArray);
			firstView = true;
			updateFooter("All thumbnails are loaded");
			enableImageMenu();
		} // end if 'all images loaded'
		}, function(err) {
		alert("Loading thumbnail error : " + err);
	});	// end image load
}  // end function
	
function updateAssessment() {
	//read user Assessment
	if(userLoggedIn) {
		var addCase = true;
		var temp = localStorage.getObj("userList");	
		var firstSession = temp[userID].assessment.sessions[0].name;
		// lint warning: comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==)
		if (firstSession === "") {
			// save current session and case
			temp[userID].assessment.sessions[0].name = currentSession;
			temp[userID].assessment.sessions[0].caseNumber = casesInSession;
			temp[userID].assessment.sessions[0].cases[0].name = caseToLoad;
			temp[userID].assessment.sessions[0].cases[0].status = "loaded";
			localStorage.setObj("userList", temp);
			addCase = false;
			// alert("First Load");
		} // end if firstSession
		
		if(addCase) {
			// check what sessions are already saved
			var sessionNumber = temp[userID].assessment.sessions.length;
			// alert("Number of sessions saved : " + sessionNumber); 
			for (j=0; j<sessionNumber; j++) {
				if(temp[userID].assessment.sessions[j].name == currentSession) {
					// add eventually new case
					var caseNumber = temp[userID].assessment.sessions[j].cases.length;
					// alert("Number of cases saved in session : " + caseNumber);
					for (i=0; i<caseNumber; i++) {
						if (temp[userID].assessment.sessions[j].cases[i].name == caseToLoad) {
						// case already saved
						addCase = false;
						// alert("Case exist");
						break;  // jump out from i Loop
						}  // end if
					} // end for i Loop
					if(addCase) {
						// push new case in array
						var newCase = {name:caseToLoad, status:"loaded"};
						temp[userID].assessment.sessions[j].cases.push(newCase);
						localStorage.setObj("userList", temp);
						addCase = false;
						// alert("New Case added in existing session");
					} // end if 
					if(!addCase) {
						break;  // jump out from j Loop
					}
				} // end if
			} // end for j Loop
		}  // end if addCase
		
		if(addCase) {
			// add new session and case 
			var newSession = {name:currentSession, caseNumber:casesInSession, cases:[{name:caseToLoad, status:"loaded"}]};
			temp[userID].assessment.sessions.push(newSession);
			localStorage.setObj("userList", temp);
			// alert("New Session with new Case added");
		}  // end if addCase
	} // end if userLoggedIn
}  // end function

function promiseError() {
	alert("An error occured during the access to the RadioLogic Archive");
}

var DicomTree;
var promiseList = [];
		
		function createPrivateSessionTree() {
			var sessionName = "";      // string
			var caseObject = {
				caseName: "",          // string
				caseDescription: "",   // string
				instanceCount: "",     // string
				answerUID: ""          // string
			};  // end caseObject
			var seriesName = "";       // string
			var instanceObject = {
				instanceNumber: 0,	   // integer
				instanceUID: ""		   // string
			};  // end instanceObject
			var urlPrefix = "http://orthancmac:8043/orthanc/";
			var tempPath = urlPrefix + "patients?expand";
			var promise = $.getJSON(tempPath);
			promise.done(function(data,status) {
				var caseList = [];
				var studiesList = [];
				var caseIdString = "";
				for (z in data) {
					var caseID = data[z].MainDicomTags.PatientID.substring(0,4);
					if (caseID == "4321") {  // RadioLogic case
						caseIdString += data[z].ID;
						caseList.push(data[z]);
					}; // end if
				};  // end for z
				var caseCRC = crc16(caseIdString);
				dicomTree = new Tree(caseCRC);
				var x;
				for (x in caseList) {
				(function(X) {
					var caseName = caseList[x].MainDicomTags.PatientName;
					var caseUID = caseList[x].ID;
					dicomTree._root.children.push(new Node(caseName));
					dicomTree._root.children[x].parent = dicomTree;
					var tempPath = urlPrefix + "patients/" + caseUID + "/series";
					var promise = $.getJSON(tempPath);
					promise.done(function(data,status) {
						responseCallback(caseList.length);
					//	console.log("*********************");
					//	console.log("CaseName : " + caseList[X].MainDicomTags.PatientName);
						var w = 2;
						for (y in data) {
							var seriesName = data[y].MainDicomTags.SeriesDescription;
							// add "instances" and "file" to instanceUID for observation and answer images
							var instanceUID = data[y].Instances[0];
							var extendedUID = "/instances/" + instanceUID + "/file";
							(function(sName, cName) {
							if (seriesName == "Observation") {
								
								dicomTree._root.children[X].children[0] = new Node(seriesName);
								dicomTree._root.children[X].children[0].parent = dicomTree._root.children[X];
								dicomTree._root.children[X].children[0].children[0] = new Node(extendedUID);
								dicomTree._root.children[X].children[0].children[0].parent = dicomTree._root.children[X];
							//	console.log("SeriesName : " + seriesName);
							//	console.log("Instance : " + data[y].Instances[0]);
							} else {
								if (seriesName == "Answer") {
									dicomTree._root.children[X].children[1] = new Node(seriesName);
									dicomTree._root.children[X].children[1].parent = dicomTree._root.children[X];
									dicomTree._root.children[X].children[1].children[0] = new Node(extendedUID);
									dicomTree._root.children[X].children[1].children[0].parent = dicomTree._root.children[X];
								//	console.log("SeriesName : " + seriesName);
								//	console.log("Instance : " + data[y].Instances[0]);
								} else {
									dicomTree._root.children[X].children[w] = new Node(seriesName);
									dicomTree._root.children[X].children[w].parent = dicomTree._root.children[X];
									var seriesUID = data[y].ID;
									var tempPath = urlPrefix + "series/" + seriesUID + "/ordered-slices";
									(function(W) {
										var promise = $.getJSON(tempPath);
										promise.done(function(data,status) {
											for (i in data.Dicom) {
												var instanceUID = data.Dicom[i];
												dicomTree._root.children[X].children[W].children[i] = new Node(instanceUID);
												dicomTree._root.children[X].children[W].children[i].parent = dicomTree._root.children[X];
											}; // end for i
										});  // end promise.done
										promise.fail(function() {
										warning();
									});  // end promise.fail	
									})(w);  // end function XX and W	
								w += 1;	
								};  // end if-else-else
							}; // end if-else
						})(seriesName, caseName);  // end function sName
						};  // end for y
					});  // end promise.done
					promise.fail(function() {
						warning();
					});  // end promise.fail	
				})(x);  // end function index
				}; // end for x
			});  // end promise.done
			promise.fail(function() {
				warning();
			});  // end promise.fail
		} // end function
		
function warning() {
	alert("There was a JSON error in the function createPrivateSessionTree. Please check if the Orthanc server is running!");
}  // end function	

function responseCallback(promiseCount) {
	promiseList.push(true);
	for (i = 0; i < promiseCount; i++) {
		if (!promiseList[i]) return;
	}; // end for i
	// get session name
	var sessionName = dicomTree._root.data;
	//console.log(sessionName);
	var output = '<option value="1">Private Session ' + sessionName + ' from Orthanc Archive</option>';
	document.getElementById("select-session").innerHTML = output;	
	$("#select-session").selectmenu("refresh");
	$('#sessionbutton').button("enable");
}  // end function	responseCallback


