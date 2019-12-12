// version 0.9 build 15

function contentSize() {
	// alert("ContentSize");
	var wh = $(window).height();
	var ww = $(window).width();
	var dh = $(document).height();
	var dw = $(document).width();
	var hh = $.mobile.activePage.find("div[data-role='header']:visible").outerHeight();
	var hho = $.mobile.activePage.find("div[data-role='header']:visible").outerHeight(true);
	var fh =  $.mobile.activePage.find("div[data-role='footer']:visible").outerHeight();
	var fho = $.mobile.activePage.find("div[data-role='footer']:visible").outerHeight(true);
	var chn = $.mobile.activePage.find("div[data-role='content']:visible:visible").height();
	var ch = $.mobile.activePage.find("div[data-role='content']:visible:visible").outerHeight();
	var cho = $.mobile.activePage.find("div[data-role='content']:visible:visible").outerHeight(true);
	var iw = $("#images").outerWidth();
	var ih =  $("#images").outerHeight();
	var iwo = $("#images").outerWidth(true);
	var iho = $("#images").outerHeight(true);
	var bw = $("#imagescontent").width();
	var bh = $("#imagescontent").height();
	var rh = getRealContentHeight();
	var im = $("#images").height();
	var icont = $("#imagescontainer").height();
	var diff1 = wh - hh - fh;
    var diff2	= 	chn -hh - fh;
    var diff3	= diff1 - (fh - chn);		
	var dimensioninfo = "<p>wh : Window height (viewport) : " + wh + "<br/>";
	dimensioninfo += "dh : Document height (HTML body) : " + dh + "<br/>";
	dimensioninfo += "<em>The following values are calculated with .outerHeight() and .outerWidth()</em><br/>";
	dimensioninfo += "hh : RadioLogic Header height including padding and border: " + hh + "<br/>";
	dimensioninfo += "hho : RadioLogic Header height including padding, border and margin : " + hho + "<br/>";
	dimensioninfo += "fh : RadioLogic Footer height including padding and border : " + fh + "<br/>";
	dimensioninfo += "fho : RadioLogic Footer height including padding, border and margin : " + fho + "<br/>";
	dimensioninfo += "ih : RadioLogic Content (container) height including padding and border : " + ih + "<br/>";
	dimensioninfo += "iho : RadioLogic Content (container) height including padding, border and margin : " + iho + "<br/>";
	dimensioninfo += "ch : Active page content height including padding and border : " + ch + "<br/>";
	dimensioninfo += "cho : Active page content height including padding, border and margin : " + cho + "<br/>";
	dimensioninfo += "<em>The following values are calculated with .height() and .width()</em><br/>";
	dimensioninfo += "chn : Active page content height : " + chn + "<br/>";
	dimensioninfo += "im : Div image page height : " + im + "<br/>";
	dimensioninfo += "icont : Div imagecontainer height : " + icont + "<br/>";
	dimensioninfo += "bh : RadioLogic inner content box height : " + bh + "<br/>";
	dimensioninfo += "<em>The following value is calculated with a function</em><br/>";
	dimensioninfo += "rh : Computed real height : " + rh + "<br/>";
	dimensioninfo += "diff1 : Heights viewport - header - footer : " + diff1 + "<br/>";
	dimensioninfo += "diff2 : Heights  container - header - footer : " + diff2 + "<br/>";
	dimensioninfo += "diff3 : Heights combination : " + diff3 + "</p>";
	document.getElementById("imagescontent").style.backgroundColor = "white";
	document.getElementById("imagescontent").style.color = "black";
	document.getElementById("imagescontent").innerHTML = dimensioninfo;
}
		
function getRealContentHeight() {
	// alert("realHeight");
	var header = $.mobile.activePage.find("div[data-role='header']:visible");
	var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
	var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
	var viewport_height = $(window).height();
 	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());
	} 
	return content_height;
}	

function testOutput() {
	// show content of the different stacks
	console.log("************* Stacks ***************");
	console.log("caseStack : " + caseStack);
	console.log("seriesImageIdStack : " + seriesImageIdStack);
	console.log("seriesInstancesStack : " + seriesInstancesStack);
	
	console.log("scrollInstancesStack : " + scrollInstancesStack);
}	

// $(cornerstone).on('CornerstoneImageLoaded', onImageLoaded);

function onImageLoaded(){
	// event works
	// alert("Imageloaded");
}

// $("#observationspanel").on('CornerstoneImageRendered', onImageRendered);

function onImageRendered(){
	// event doesn't work
	alert("ImageRendered"); 
}
