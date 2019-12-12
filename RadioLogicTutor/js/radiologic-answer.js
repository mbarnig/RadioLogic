// version 0.9 build 15

function showAnswer() {
	var element = document.getElementById("answerpanel");
	cornerstone.enable(element);
	cornerstone.displayImage(element, answerImage);
	console.log("showAnswer element and image");
	console.log(element);
	console.log(answerImage);
}  // end showAnswer

function enableAnswer() {
	$("#main li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#login li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#about li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#settings li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#cases li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#observations li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#images li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#diagnosis li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#results li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
	$("#help li:nth-child(8)").removeClass("ui-disabled").addClass("ui-enabled");
}

function disableAnswer() {
	$("#main li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#login li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#about li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#settings li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#cases li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#observations li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#images li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#diagnosis li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#results li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
	$("#help li:nth-child(8)").removeClass("ui-enabled").addClass("ui-disabled");
}