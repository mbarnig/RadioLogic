// version 0.9 build 15

function showObservation() {
	var element = document.getElementById("observationspanel");
	cornerstone.enable(element);
	// enable mouse Input
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.mouseWheelInput.enable(element);
	cornerstone.displayImage(element, observationImages[caseToLoad]);
	console.log("showObservation element and image");
	console.log(element);
	console.log(observationImages[caseToLoad]);
	// enable zoom tools
	cornerstoneTools.zoom.activate(element, 4);
	cornerstoneTools.zoomWheel.activate(element);
}  // end showObservation
