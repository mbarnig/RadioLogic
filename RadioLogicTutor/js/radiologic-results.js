// version 0.9 build 15

function evaluateAssessment() {
	var totalSessions = 0;  // 1
	var completedSessions = 0;  // 2
	var correctSessions = 0;  // 3
	var wrongSessions = 0;  // 4
	var pendingSessions = 0;  // 5
	var totalCases = 0;  // 6
	var submittedCases = 0;  // 7
	var correctCases = 0;  // 8
	var wrongCases = 0;  // 9
	var pendingCases = 0;  // 10
	var temp = localStorage.getObj("userList");	
	// check that the first session is not empty
	if(temp[userID].assessment.sessions[0].name !== ""){
	var totalSessions = temp[userID].assessment.sessions.length;  // >1
	debugLog("***** Assessment : *************");
	for (j=0; j<totalSessions; j++) {
		var completeSession = false;
		var caseNumber = temp[userID].assessment.sessions[j].cases.length;
		totalCases += temp[userID].assessment.sessions[j].caseNumber; // >6
		if(caseNumber == temp[userID].assessment.sessions[j].caseNumber) {
			completedSessions++;  // >2
			completeSession = true;
		}
		debugLog("SessionName : " + temp[userID].assessment.sessions[j].name);
		debugLog("CasesInSession : " + temp[userID].assessment.sessions[j].caseNumber);
		var tempCorrectCases = 0;
		var tempPendingCases = 0;
		for (i=0; i<caseNumber; i++) {
			debugLog("CaseName : " + temp[userID].assessment.sessions[j].cases[i].name);
			debugLog("CaseStatus : " + temp[userID].assessment.sessions[j].cases[i].status);
			if(temp[userID].assessment.sessions[j].cases[i].status == "correct"){
				correctCases++;  // >8
				tempCorrectCases++;
			} else {
				if(temp[userID].assessment.sessions[j].cases[i].status == "wrong") {
					wrongCases++;  // >9
					} else {
						pendingCases++;  // > 10
						tempPendingCases++;
				}  // end if wrong
			}  // end if correct
		} // end for i
		// check if this session is complete and if yes, correct or wrong ?
		if(completeSession){
			if(tempCorrectCases == caseNumber) {
				correctSessions++;
			} else {
				if (tempPendingCases !== caseNumber){
					wrongSessions++;
				}
			}
		}
	}  // end for j
	pendingSessions = totalSessions - completedSessions;  // >1
	submittedCases = correctCases + wrongCases;  // >7
	}  // end if
	debugLog("Total Sessions : " + totalSessions);
	debugLog("Completed Sessions : " + completedSessions);
	debugLog("Correct Sessions : " + correctSessions);
	debugLog("Wrong Sessions : " + wrongSessions);
	debugLog("Total Cases : " + totalCases);
	debugLog("Submitted Cases : " + submittedCases);
	debugLog("Correct Cases : " + correctCases);
	debugLog("Wrong Cases : " + wrongCases);
	debugLog("Pending Cases : " + pendingCases);
	
	showProgress(completedSessions, pendingSessions, submittedCases, pendingCases, deviceOrientation);
	showPerformance(correctSessions, wrongSessions, correctCases, wrongCases, deviceOrientation);
}

function enableResults() {
	$("#main li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#login li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#about li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#settings li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#cases li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#observations li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	// $("#images li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#diagnosis li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#answer li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#help li:nth-child(9)").removeClass("ui-disabled").addClass("ui-enabled");
}
		
function disableResults() {
	$("#main li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#login li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#about li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#settings li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#cases li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#observations li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	// $("#images li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#diagnosis li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#answer li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#help li:nth-child(9)").removeClass("ui-enabled").addClass("ui-disabled");
}

function showResults() {
	// alert("Results");
	evaluateAssessment();
}  // end showResults

function sendResults() {
	// version 2
	alert("in development");
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#main");
}

// link to color names : http://www.computerhope.com/htmcolor.htm

function showProgress(completedSessions, pendingSessions, submittedDiagnoses, pendingCases, orientation) {
	var charttitle = "Your Progress";
	var s1 = [['completed sessions', completedSessions], ['pending sessions', pendingSessions], ['submitted diagnoses', 0], ['pending cases', 0]];
	var s2 = [['completed sessions', 0], ['pending sessions', 0], ['submitted diagnoses', submittedDiagnoses], ['pending cases', pendingCases]];
	var plot = $.jqplot('progresschart', [s1, s2], {
		 title : charttitle,
		 seriesColors : ["#306EFF", "#79BAEC", "#E238EC", "#A74AC7"],  // ribbon blue, denim, crimson, purple flower
		 grid : {background : "#000000"},
		 legend: { 
            show:true,
            placement : "outside",
			marginLeft : "426px",
			location: "ne",
			background : "silver",
            rendererOptions: {
                numberRows: 4
            }
		 },
		 seriesDefaults: {
			renderer:$.jqplot.DonutRenderer,
			rendererOptions: {
				sliceMargin: 3,
				startAngle: -90,
				showDataLabels: true,
				dataLabels: 'value'
			}
		}
	});
	if(orientation == "portrait"){
		plot.legend.marginLeft = "100px";
		plot.legend.marginTop = "50px";
	}
	plot.replot();
}
	
function showPerformance(correctSessions, wrongSessions, correctDiagnoses, wrongDiagnoses, orientation) {
	var charttitle = "Your Performance";
	var s1 = [['correct sessions', correctSessions], ['wrong sessions', wrongSessions], ['correct diagnoses', 0], ['false diagnoses', 0]];
	var s2 = [['correct sessions', 0], ['wrong sessions', 0], ['correct diagnoses', correctDiagnoses], ['false diagnoses', wrongDiagnoses]];
	var plot = $.jqplot('performancechart', [s1, s2], {
		title : charttitle,
		seriesColors : ["#FDD017", "#CD7f32", "#4CC417", "#FF2400"],  // bright gold, bronze, apple green, scarlet
		grid : {background : "#000000"},
		legend : {
			show : true, 
			location : "se",
			placement : "outside",
			marginLeft : "16px",
			background : "silver",
			rendererOptions: {
				numberRows: 4
			}
		},
		seriesDefaults: {
			renderer:$.jqplot.DonutRenderer,
			rendererOptions: {
				sliceMargin: 3,
				startAngle: -90,
				showDataLabels: true,
				dataLabels: 'value'
			}
		}
	});
	if(orientation == "portrait"){
		plot.legend.marginLeft = "100px";
		plot.legend.marginBottom = "400px";
	}
	plot.replot();
}

function loadGlobalResults() {
		// attention : error "mal formé" if loaded as local file
		// version 2
		if (myresults) {
		myresults = false;
		$("#globalResultsButton").text("Show me my own results");
			$.getJSON("json/globalresults.json", function(result) {
				var results = result.radiologicResultsList;
				var submittedDiagnoses = results.submittedDiagnoses;
				var pendingCases = results.pendingCases;
				var completedModules = results.completedModules;
				var unfinishedModules = results.unfinishedModules;
				var correctDiagnoses = results.correctDiagnoses;
				var falseDiagnoses = results.falseDiagnoses;
				var correctModules = results.correctModules;
				var wrongModules = results.wrongModules;
				showProgress(completedModules, unfinishedModules, submittedDiagnoses, pendingCases, "General Progress");
				showPerformance(correctDiagnoses, falseDiagnoses, correctModules, wrongModules, "General Performance");
				});  // end getJSON
			} else {
			myresults = true;
			showMyResults();
			$("#globalResultsButton").text("Show me the anonymized global results of other users");
			}
}  // end loadGlobalResults()

function landscapeLayoutResults() {
	document.getElementById('resultspanel').style.width="960px";
	document.getElementById('chartwrapper').style.width="810px";
	document.getElementById('chartwrapper').style.height="400px";
	document.getElementById('chartLegend').style.width="150px";
	document.getElementById('chartLegend').style.height="400px";
	document.getElementById('resultsButtonWrapper').style.width="960px";
	document.getElementById('resultsButtonWrapper').style.height="100px";
	evaluateAssessment();
}

function portraitLayoutResults() {
	orientation = "portrait";
	document.getElementById('resultspanel').style.width="720px";
	document.getElementById('chartwrapper').style.width="400px";
	document.getElementById('chartwrapper').style.height="820px";
	document.getElementById('chartLegend').style.width="320px";
	document.getElementById('chartLegend').style.height="500px";
	document.getElementById('resultsButtonWrapper').style.width="320px";
	document.getElementById('resultsButtonWrapper').style.height="320px";
	evaluateAssessment();
}	
		
		