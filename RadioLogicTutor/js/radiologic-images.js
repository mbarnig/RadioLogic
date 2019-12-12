// version 0.9 build 16

"use strict";
		// global variables
		var deviceOrientation = "landscape";
		var dicomThumbContainerVerticalLength = "100%";
		var dicomThumbContainerHorizontalLength = "100%";
		var dicomThumbContainerVerticalWidth = "86px";
		var dicomThumbContainerHorizontalHeight = "102px";
		var draggedElement = {};
		var hammerManager = {};
				
		// viewport states
		var vpltState = "quarter";
		var vprtState = "quarter";
		var vplbState = "quarter";
		var vprbState = "quarter";
		
		function manageViewports() {
			deactivateAllTools();
			if(firstView){
				firstView = false;
				viewports = {
					viewPanelLeftTop : {},
					viewPanelLeftBottom : {},
					viewPanelRightTop : {},
					viewPanelRightBottom : {}
				}
				addThumbnails();
				addDICOMimages();
			}  // end if
			manageHammer(true);
		}
		
		function handler(event) {
			if(event.type == "panend") {
				changeLayout(event) ;
			}  // end panend
		}
		
function manageHammer(state) {
	var handler = function(event) {
		//console.log(event);
		if(event.isFirst) {
			// get starting Element
			//console.log("Hammer Start");
			//console.log(event.target.parentElement.parentElement.getAttribute("id"));
			//console.log(event.target.parentElement.getAttribute("id"));
		}
		
		
		// test if click/tap with small movement
		if(event.isFinal) {
			// get ending Element
			//console.log("Hammer End");
			//console.log(event.target.parentElement.parentElement.getAttribute("id"));
			//console.log(event.target.parentElement.getAttribute("id"));
			if((event.distance > 10) && (event.distance < 200)) {
				// toggle quarter / half / full vPLT - vPLB - vPRT - vPRB with thumbnailPanel
				changeLayout(event);
			}
		}
	};
	if(state){
		hammerManager.set({enable: true});
		hammerManager.on("hammer.input", handler);  // handler defined in manageHammer function
	} else {
		hammerManager.set({enable: false});
		hammerManager.off("hammer.input", handler); // handler defined in manageHammer function
	}
}
				
		function changeLayout(event) {
			var element1 = document.getElementById("viewPanelLeftTop");
			var element2 = document.getElementById("viewPanelLeftBottom");
			var element3 = document.getElementById("viewPanelRightTop");
			var element4 = document.getElementById("viewPanelRightBottom");
			var goal = event.target.parentElement.getAttribute("id");
			if(goal == "imagesPanel"){
			goal = event.target.getAttribute("id");
			}
			switch(goal) {
			case "viewPanelLeftTop" :
				switch(vpltState) {
				case "quarter" :
					vpltState = "half";
					element2.style.display = "none";
					element1.style.height = "100%";
				break;
				case "half" :
					vpltState = "full";
					element2.style.display = "none";
					element3.style.display = "none";
					element4.style.display = "none";
					element1.style.width = "100%";
				break;
				case "full" :
					vpltState = "quarter";
					element1.style.width = "50%";
					element1.style.height = "50%";
					element2.style.display = "block";
					if(vprtState == "half") {
						element3.style.display = "block";
						element4.style.display = "none";
					} else {
						if(vprbState == "half") {
							element3.style.display = "none";
							element4.style.display = "block";
						} else { // both elements are quarter
							element3.style.display = "block";
							element4.style.display = "block";
							}
						}
				break;
				default :
				// do nothing
				break;
				}  // end switch vpltState
			break;
			// ****************************************************************
			case "viewPanelRightTop" :
				switch(vprtState) {
				case "quarter" :
					vprtState = "half";
					element4.style.display = "none";
					element3.style.height = "100%";
				break;
				case "half" :
					vprtState = "full";
					element1.style.display = "none";
					element2.style.display = "none";
					element4.style.display = "none";
					element3.style.width = "100%";
				break;
				case "full" :
					vprtState = "quarter";
					element3.style.width = "50%";
					element3.style.height = "50%";
					element4.style.display = "block";
					if(vpltState == "half") {
						element1.style.display = "block";
						element2.style.display = "none";
					} else {
						if(vplbState == "half") {
							element1.style.display = "none";
							element2.style.display = "block";
						} else { // both elements are quarter
							element1.style.display = "block";
							element2.style.display = "block";
							}
						}
				break;
				default :
				// do nothing
				break;
				}  // end switch vprtState
			break;
			// ***************************************************************
			case "viewPanelLeftBottom" :
				switch(vplbState) {
				case "quarter" :
					vplbState = "half";
					element1.style.display = "none";
					element2.style.height = "100%";
				break;
				case "half" :
					vplbState = "full";
					element1.style.display = "none";
					element3.style.display = "none";
					element4.style.display = "none";
					element2.style.width = "100%";
				break;
				case "full" :
					vplbState = "quarter";
					element2.style.width = "50%";
					element2.style.height = "50%";
					element1.style.display = "block";
					if(vprtState == "half") {
						element3.style.display = "block";
						element4.style.display = "none";
					} else {
						if(vprbState == "half") {
							element3.style.display = "none";
							element4.style.display = "block";
						} else { // both elements are quarter
							element3.style.display = "block";
							element4.style.display = "block";
							}
						}
				break;
				default :
				// do nothing
				break;
				}  // end switch vplbState
			break;
			// ********************************************************
			case "viewPanelRightBottom" :
				switch(vprbState) {
				case "quarter" :
					vprbState = "half";
					element3.style.display = "none";
					element4.style.height = "100%";
				break;
				case "half" :
					vprbState = "full";
					element1.style.display = "none";
					element2.style.display = "none";
					element3.style.display = "none";
					element4.style.width = "100%";
				break;
				case "full" :
					vprbState = "quarter";
					element4.style.width = "50%";
					element4.style.height = "50%";
					element3.style.display = "block";
					if(vpltState == "half") {
						element1.style.display = "block";
						element2.style.display = "none";
					} else {
						if(vplbState == "half") {
							element1.style.display = "none";
							element2.style.display = "block";
						} else { // both elements are quarter
							element1.style.display = "block";
							element2.style.display = "block";
							}
						}
				break;
				default :
				// do nothing
				break;
				}  // end switch vplbState
			break;
			default :
			// do nothing
			break;
			}  // end switch
			if(Object.keys(viewports.viewPanelLeftTop).length != 0) {
				cornerstone.resize(element1, true);
			}
			if(Object.keys(viewports.viewPanelLeftBottom).length != 0) {
				cornerstone.resize(element2, true);
			}
			if(Object.keys(viewports.viewPanelRightTop).length != 0) {
				cornerstone.resize(element3, true);
			}
			if(Object.keys(viewports.viewPanelRightBottom).length != 0) {
				cornerstone.resize(element4, true);
			}
		}
		
		function portraitLayoutImages() {
			deviceOrientation = "portrait";
			document.getElementById("imagesPanel").style.height = "80%";
			document.getElementById("imagesPanel").style.width = "100%";
			document.getElementById("imagesPanel").style.left = 0;
			document.getElementById("thumbnailPanel").style.height = "20%";
			document.getElementById("thumbnailPanel").style.width = "100%";
			document.getElementById("thumbnailPanel").style.overflowX = "scroll";
			document.getElementById("thumbnailPanel").style.overflowY = "hidden";
			document.getElementById("thumbnailContainer").style.height = dicomThumbContainerHorizontalHeight;
			document.getElementById("thumbnailContainer").style.width = dicomThumbContainerHorizontalLength;
		}
		
		function landscapeLayoutImages(){
			deviceOrientation = "landscape";
			document.getElementById("imagesPanel").style.height = "100%";
			document.getElementById("imagesPanel").style.width = "90%";
			document.getElementById("imagesPanel").style.left = "10%";
			document.getElementById("thumbnailPanel").style.height = "100%";
			document.getElementById("thumbnailPanel").style.width = "10%";
			document.getElementById("thumbnailPanel").style.overflowX = "hidden";
			document.getElementById("thumbnailPanel").style.overflowY = "scroll";
			document.getElementById("thumbnailContainer").style.height = dicomThumbContainerVerticalLength;
			document.getElementById("thumbnailContainer").style.width = dicomThumbContainerVerticalWidth;
		}
		
		function drag(ev) {
			ev.dataTransfer.setData("text", ev.target.id);
			draggedElement = ev.target.id;  // global variable
			//console.log("Dragged Element");
			//console.log(ev.target.getAttribute("id"));
		}
		
		function allowDrop(ev) {
			ev.preventDefault();
		}

		function drop(ev) {
			ev.preventDefault();
			var element = ev.target;
			if(element.getAttribute("id") == null) {
				element = ev.target.parentElement;
			}
			// test
			//console.log("Dropped Element");
			//console.log(element.getAttribute("id"));
			// get image index in Stack
			var item = document.getElementById(draggedElement);
			var elementId = item.getAttribute('id');
			var indexString = elementId.replace('drag','');
			var index = parseInt(indexString) - 1;
			var elementName = element.getAttribute('id');
			cornerstone.enable(element);
			var image = caseArray[index].seriesImageStack[0];
			var viewport = cornerstone.getDefaultViewportForImage(element, image);
			switch(elementName) {
				case "viewPanelLeftTop" :
					viewports.viewPanelLeftTop = viewport;
					viewports.viewPanelLeftTopIndex = index;
				break;
				case "viewPanelLeftBottom" :
					viewports.viewPanelLeftBottom = viewport;
					viewports.viewPanelLeftBottomIndex = index;
				break;
				case "viewPanelRightTop" :
					viewports.viewPanelRightTop = viewport;
					viewports.viewPanelRightTopIndex = index;
				break;
				case "viewPanelRightBottom" :
					viewports.viewPanelRightBottom = viewport;
					viewports.viewPanelRightBottomIndex = index;
				break;
				default :
				// do nothing
				break;
			}  // end switch
			// display dragged image
			cornerstone.displayImage(element, image, viewport);
			// clear imageStack; when you enable stackPrefetch on an element it checks
			// if there was previously stackPrefetch data related to this element, 
			// and if so, it clears all prefetch data from the requestPoolManager.
			var stack = {
			currentImageIdIndex : caseArray[index].seriesImageIndex,
			imageIds: caseArray[index].seriesImageIds
			};
			cornerstoneTools.addStackStateManager(element, ['stack']);
			cornerstoneTools.addToolState(element, 'stack', stack);
			// cornerstoneTools.stackPrefetch.disable(element);
			cornerstoneTools.stackPrefetch.enable(element);
			var imageNumber = caseArray[index].seriesImageIds.length;
			if(imageNumber > 1){
				cornerstoneTools.scrollIndicator.enable(element);
			}
		}
		
		function addThumbnails() {
			// alert("Thumbnails");
			var element = document.getElementById('thumbnailContainer');
			// clear thumbnailContainer
			element.innerHTML = "";
			// var seriesNumber = 20;
			// var thumbnailColors = ["#FF2400", "#6AFB92", "#00FFFF", "#800080", "#C68E17", "#990012", "#FF00FF", "#FBB117", "#4CC417", "#008080", "#7D0541", "#EDDA74", "#6960EC",  "#E42217", "#728C00", "#FAAFBE", "#FF7F50", "#B2C248", "#4863A0", "#806517"];
			for(var index = 0; index < seriesNumber; index++){
			var thumbnail = document.createElement('div');
			thumbnail.classList.add("thumbnailWrapper");
			// thumbnail.style.backgroundColor = thumbnailColors[index];
			// add HTML5 drag and drop attributes
			thumbnail.setAttribute("id", "drag" + (index + 1)); 
			thumbnail.setAttribute("draggable", "true");
			thumbnail.setAttribute("ondragstart", "drag(event)");
			var thContent = document.createElement('div');
			thContent.classList.add("thumbnailContent");
			thumbnail.appendChild(thContent);
			var thLegend = document.createElement('div');
			thLegend.classList.add('thumbnailLegend');
			var seriesName = (index + 1).toString();
			thLegend.innerHTML = seriesName;
			thumbnail.appendChild(thLegend);
			element.appendChild(thumbnail);
			} // end for index
			// set the correct height and width of the thumbnailContainer
			// calculate vertical lenght of 'thumbnailContainer' element : vl = 1*margin + seriesNumber * (thumbheight + 2*border + 1*margin)
			dicomThumbContainerVerticalLength = (4 + seriesNumber * (92 + 2 + 4)).toString() + "px";
			document.getElementById('thumbnailContainer').style.height = dicomThumbContainerVerticalLength;
			// calculate horizontal lenght of 'thumbnailContainer' element : hl = 1*margin + seriesNumber * (thumbwidth + 2*border + 1*margin)
			dicomThumbContainerHorizontalLength = (4 + seriesNumber * (76 + 2 + 4)).toString() + "px";
			if(deviceOrientation == "landscape"){
				document.getElementById('thumbnailContainer').style.height = dicomThumbContainerVerticalLength;
				document.getElementById('thumbnailContainer').style.width = dicomThumbContainerVerticalWidth;
			} else {  // portrait
				document.getElementById('thumbnailContainer').style.width = dicomThumbContainerHorizontalLength;
				document.getElementById('thumbnailContainer').style.height = dicomThumbContainerHorizontalHeight;
			}
		}
		
		function addDICOMimages() {
			// draw DICOM thumbnails
			var element = document.getElementById('thumbnailContainer');
			for (var i = 0 ; i < seriesNumber; i++ ){
			var legend = caseArray[i].seriesName;
			var image = caseArray[i].seriesImageStack[0];
			var thumbnail = [];
			thumbnail[i] = element.childNodes[i].firstChild;
			element.childNodes[i].childNodes[1].innerHTML = legend;
			cornerstone.enable(thumbnail[i]);
			cornerstone.displayImage(thumbnail[i], image);
			}
		}
		
function zoom() {
	deactivateAllTools();
	manageHammer(false);
	// disable viewpanel layout changes
	// enable zoom tools
	// use two fingers to drag pan
	// cornerstoneTools.panMultiTouch.activate(element);
	var element = document.getElementById("viewPanelLeftTop");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.mouseWheelInput.enable(element);
	cornerstoneTools.zoomWheel.activate(element);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.zoomTouchPinch.activate(element);
	cornerstoneTools.panTouchDrag.activate(element);
	var element = document.getElementById("viewPanelLeftBottom");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.mouseWheelInput.enable(element);
	cornerstoneTools.zoomWheel.activate(element);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.zoomTouchPinch.activate(element);
	cornerstoneTools.panTouchDrag.activate(element);
	var element = document.getElementById("viewPanelRightTop");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.mouseWheelInput.enable(element);
	cornerstoneTools.zoomWheel.activate(element);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.zoomTouchPinch.activate(element);
	cornerstoneTools.panTouchDrag.activate(element);
	var element = document.getElementById("viewPanelRightBottom");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.mouseWheelInput.enable(element);
	cornerstoneTools.zoomWheel.activate(element);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.zoomTouchPinch.activate(element);
	cornerstoneTools.panTouchDrag.activate(element);
}

function deactivateAllTools() {
	var element = document.getElementById("viewPanelLeftTop");
	cornerstoneTools.mouseInput.disable(element);
	cornerstoneTools.mouseWheelInput.disable(element);
	cornerstoneTools.zoomWheel.deactivate(element);
	cornerstoneTools.touchInput.disable(element);
	cornerstoneTools.zoomTouchPinch.deactivate(element);
	cornerstoneTools.panTouchDrag.deactivate(element);
	cornerstoneTools.wwwc.deactivate(element, 1);
	cornerstoneTools.wwwcTouchDrag.deactivate(element);
	cornerstoneTools.stackScroll.deactivate(element, 1);
    cornerstoneTools.stackScrollWheel.deactivate(element);
	cornerstoneTools.stackScrollTouchDrag.deactivate(element);
	cornerstoneTools.scrollIndicator.disable(element);
	var element = document.getElementById("viewPanelLeftBottom");
	cornerstoneTools.mouseInput.disable(element);
	cornerstoneTools.mouseWheelInput.disable(element);
	cornerstoneTools.zoomWheel.deactivate(element);
	cornerstoneTools.touchInput.disable(element);
	cornerstoneTools.zoomTouchPinch.deactivate(element);
	cornerstoneTools.panTouchDrag.deactivate(element);
	cornerstoneTools.wwwc.deactivate(element, 1);
	cornerstoneTools.wwwcTouchDrag.deactivate(element);
	cornerstoneTools.stackScroll.deactivate(element, 1);
    cornerstoneTools.stackScrollWheel.deactivate(element);
	cornerstoneTools.stackScrollTouchDrag.deactivate(element);
	cornerstoneTools.scrollIndicator.disable(element);
	var element = document.getElementById("viewPanelRightTop");
	cornerstoneTools.mouseInput.disable(element);
	cornerstoneTools.mouseWheelInput.disable(element);
	cornerstoneTools.zoomWheel.deactivate(element);
	cornerstoneTools.touchInput.disable(element);
	cornerstoneTools.zoomTouchPinch.deactivate(element);
	cornerstoneTools.panTouchDrag.deactivate(element);
	cornerstoneTools.wwwc.deactivate(element, 1);
	cornerstoneTools.wwwcTouchDrag.deactivate(element);
	cornerstoneTools.stackScroll.deactivate(element, 1);
    cornerstoneTools.stackScrollWheel.deactivate(element);
	cornerstoneTools.stackScrollTouchDrag.deactivate(element);
	cornerstoneTools.scrollIndicator.disable(element);
	var element = document.getElementById("viewPanelRightBottom");
	cornerstoneTools.mouseInput.disable(element);
	cornerstoneTools.mouseWheelInput.disable(element);
	cornerstoneTools.zoomWheel.deactivate(element);
	cornerstoneTools.touchInput.disable(element);
	cornerstoneTools.zoomTouchPinch.deactivate(element);
	cornerstoneTools.panTouchDrag.deactivate(element);
	cornerstoneTools.wwwc.deactivate(element, 1);
	cornerstoneTools.wwwcTouchDrag.deactivate(element);
	cornerstoneTools.stackScroll.deactivate(element, 1);
    cornerstoneTools.stackScrollWheel.deactivate(element);
	cornerstoneTools.stackScrollTouchDrag.deactivate(element);
	cornerstoneTools.scrollIndicator.disable(element);
	// deactivate drag and drop thumbnails
}

function resetViewport(){
	deactivateAllTools();
	manageHammer(false);
	// activate drag and drop
}

function changeContrast(){
	deactivateAllTools();
	manageHammer(false);
	// disable viewpanel layout changes
	// version 2 : add different strategies for wwwc (Osirix, ...)
	var element = document.getElementById("viewPanelLeftTop");
	// activate 1 = left mousebutton
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.wwwc.activate(element, 1); 
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.wwwcTouchDrag.activate(element);
	var element = document.getElementById("viewPanelLeftBottom");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.wwwc.activate(element, 1);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.wwwcTouchDrag.activate(element);
	var element = document.getElementById("viewPanelRightTop");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.wwwc.activate(element, 1);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.wwwcTouchDrag.activate(element);
	var element = document.getElementById("viewPanelRightBottom");
	cornerstoneTools.mouseInput.enable(element);
	cornerstoneTools.wwwc.activate(element, 1);
	cornerstoneTools.touchInput.enable(element);
	cornerstoneTools.wwwcTouchDrag.activate(element);
	}

function scrollStack(){
	deactivateAllTools();
	manageHammer(false);
	// disable viewpanel layout changes
	// viewPanelLeftTop
	if(Object.keys(viewports.viewPanelLeftTop).length != 0) {
		var index1 = viewports.viewPanelLeftTopIndex;
		var element1 = document.getElementById("viewPanelLeftTop");
		var imageNumber1 = caseArray[index1].seriesImageIds.length;
		// enable scrolling
		cornerstoneTools.mouseInput.enable(element1);
		cornerstoneTools.mouseWheelInput.enable(element1);
		cornerstoneTools.stackScroll.activate(element1, 1);
		cornerstoneTools.stackScrollWheel.activate(element1);
		cornerstoneTools.touchInput.enable(element1);
		cornerstoneTools.stackScrollTouchDrag.activate(element1);
		if(imageNumber1 > 1){
			cornerstoneTools.scrollIndicator.enable(element1);
		}
	}
	// viewPanelLeftBottom
	if(Object.keys(viewports.viewPanelLeftBottom).length != 0) {
		var index2 = viewports.viewPanelLeftBottomIndex;
		var element2 = document.getElementById("viewPanelLeftBottom");
		var imageNumber2 = caseArray[index2].seriesImageIds.length;
		// enable scrolling
		cornerstoneTools.mouseInput.enable(element2);
		cornerstoneTools.mouseWheelInput.enable(element2);
		cornerstoneTools.stackScroll.activate(element2, 1);
		cornerstoneTools.stackScrollWheel.activate(element2);
		cornerstoneTools.touchInput.enable(element2);
		cornerstoneTools.stackScrollTouchDrag.activate(element2);
		if(imageNumber2 > 1){
			cornerstoneTools.scrollIndicator.enable(element2);
		}
	}
	// viewPanelRightTop
	if(Object.keys(viewports.viewPanelRightTop).length != 0) {
		var index3 = viewports.viewPanelRightTopIndex;
		var element3 = document.getElementById("viewPanelRightTop");
		var imageNumber3 = caseArray[index3].seriesImageIds.length;
		// enable scrolling
		cornerstoneTools.mouseInput.enable(element3);
		cornerstoneTools.mouseWheelInput.enable(element3);
		cornerstoneTools.stackScroll.activate(element3, 1);
		cornerstoneTools.stackScrollWheel.activate(element3);
		cornerstoneTools.touchInput.enable(element3);
		cornerstoneTools.stackScrollTouchDrag.activate(element3);
		if(imageNumber3 > 1){
			cornerstoneTools.scrollIndicator.enable(element3);
		}
	}
	// viewPanelRightBottom
	if(Object.keys(viewports.viewPanelRightBottom).length != 0) {
		var index4 = viewports.viewPanelRightBottomIndex;
		var element4 = document.getElementById("viewPanelRightBottom");
		var imageNumber4 = caseArray[index4].seriesImageIds.length;
		// enable scrolling
		cornerstoneTools.mouseInput.enable(element4);
		cornerstoneTools.mouseWheelInput.enable(element4);
		cornerstoneTools.stackScroll.activate(element4, 1);
		cornerstoneTools.stackScrollWheel.activate(element4);
		cornerstoneTools.touchInput.enable(element4);
		cornerstoneTools.stackScrollTouchDrag.activate(element4);
		if(imageNumber4 > 1){
			cornerstoneTools.scrollIndicator.enable(element4);
		}
	}
}

function overlayInfo(){
	deactivateAllTools();
	manageHammer(false);
	var link = $("#images").find("li a").eq(5);
	var linkText = "";
	var overlays1 = document.getElementsByClassName("topleft");
	var overlays2 = document.getElementsByClassName("bottomleft");
	var overlays3 = document.getElementsByClassName("topright");
	var overlays4 = document.getElementsByClassName("bottomright");
	if(info) {
		info = false;
		linkText = link.text().replace("Info On", "Info Off");
		link.text( linkText);
		for (var i=0; i<4; i++) {
			overlays1[i].style.display = "none";
			overlays2[i].style.display = "none";
			overlays3[i].style.display = "none";
			overlays4[i].style.display = "none";
		}
	} else {
		info = true;
		linkText = link.text().replace("Info Off", "Info On");
		link.text( linkText);
		for (var i=0; i<4; i++) {
			overlays1[i].style.display = "block";
			overlays2[i].style.display = "block";
			overlays3[i].style.display = "block";
			overlays4[i].style.display = "block";
		}
	}
	
}

function leftTopImageRendered() {
	var element = document.getElementById('viewPanelLeftTop');
	var viewport = cornerstone.getViewport(element);
	var windowCenter = viewport.voi.windowCenter.toFixed(0);
	var windowWidth = viewport.voi.windowWidth.toFixed(0);
	var zoomScale = viewport.scale.toFixed(2);
	var index = viewports.viewPanelLeftTopIndex;
	var instanceNumber = caseArray[index].seriesImageIds.length;

	var imageIndex = 1 + caseArray[index].seriesImageIndex;

	// update viewport infos
	element.childNodes[1].innerHTML = "Series : " + caseArray[index].seriesName;  //topleft
	element.childNodes[3].innerHTML = "WW : " + windowWidth + "; WC : " + windowCenter;  // topright
	element.childNodes[5].innerHTML = "Image Number : " + imageIndex + " / " + instanceNumber;  // bottomleft
	element.childNodes[7].innerHTML = "Zoom : " + zoomScale;  // bottomright
}

function rightTopImageRendered() {
	var element = document.getElementById('viewPanelRightTop');
	var viewport = cornerstone.getViewport(element);
	var windowCenter = viewport.voi.windowCenter.toFixed(0);
	var windowWidth = viewport.voi.windowWidth.toFixed(0);
	var zoomScale = viewport.scale.toFixed(2);
	var index = viewports.viewPanelRightTopIndex;
	var instanceNumber = caseArray[index].seriesImageIds.length;
	var imageIndex = 1 + caseArray[index].seriesImageIndex;
	// update viewport infos
	element.childNodes[1].innerHTML = "Series : " + caseArray[index].seriesName;  //topleft
	element.childNodes[3].innerHTML = "WW : " + windowWidth + "; WC : " + windowCenter;  // topright
	element.childNodes[5].innerHTML = "Image Number : " + imageIndex + " / " + instanceNumber;  // bottomleft
	element.childNodes[7].innerHTML = "Zoom : " + zoomScale;  // bottomright
}
	
function leftBottomImageRendered() {
	var element = document.getElementById('viewPanelLeftBottom');
	var viewport = cornerstone.getViewport(element);
	var windowCenter = viewport.voi.windowCenter.toFixed(0);
	var windowWidth = viewport.voi.windowWidth.toFixed(0);
	var zoomScale = viewport.scale.toFixed(2);
	var index = viewports.viewPanelLeftBottomIndex;
	var instanceNumber = caseArray[index].seriesImageIds.length;
	var imageIndex = 1 + caseArray[index].seriesImageIndex;
	// update viewport infos
	element.childNodes[1].innerHTML = "Series : " + caseArray[index].seriesName;  //topleft
	element.childNodes[3].innerHTML = "WW : " + windowWidth + "; WC : " + windowCenter;  // topright
	element.childNodes[5].innerHTML = "Image Number : " + imageIndex + " / " + instanceNumber;  // bottomleft
	element.childNodes[7].innerHTML = "Zoom : " + zoomScale;  // bottomright {
	//alert("Left bottom image rendered");
}

function rightBottomImageRendered() {
	var element = document.getElementById('viewPanelRightBottom');
	var viewport = cornerstone.getViewport(element);
	var windowCenter = viewport.voi.windowCenter.toFixed(0);
	var windowWidth = viewport.voi.windowWidth.toFixed(0);
	var zoomScale = viewport.scale.toFixed(2);
	var index = viewports.viewPanelRightBottomIndex;
	var instanceNumber = caseArray[index].seriesImageIds.length;
	var imageIndex = 1 + caseArray[index].seriesImageIndex;
	// update viewport infos
	element.childNodes[1].innerHTML = "Series : " + caseArray[index].seriesName;  //topleft
	element.childNodes[3].innerHTML = "WW : " + windowWidth + "; WC : " + windowCenter;  // topright
	element.childNodes[5].innerHTML = "Image Number : " + imageIndex + " / " + instanceNumber;  // bottomleft
	element.childNodes[7].innerHTML = "Zoom : " + zoomScale;  // bottomright
}	



		