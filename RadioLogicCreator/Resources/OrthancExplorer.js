$('#lookup').live('pagebeforecreate', function() {
  var b = $('<a class="ui-btn ui-btn-icon-left ui-corner-right ui-controlgroup-last ui-btn-up-a" href="#plugins" data-icon="home" data-role="button" data-direction="reverse" data-corners="true" data-shadow="true" data-iconshadow="true" datawrapperels="span" data-theme="a"> <span class="ui-btn-inner ui-corner-right ui-controlgroup-last"> <span class="ui-btn-text">RadioLogicCreator</span> <span class="ui-icon ui-icon-grid ui-icon-shadow"> </span> </span> </a>');
  b.insertBefore(document.getElementById("lookup").children[0].children[1].children[1]);
  b.click(function() {
    if ($.mobile.pageData) {
		var myURL = myFunction("Lookup");
		window.open(myURL, '_self');
    }
  });
});

$('#plugins').live('pagebeforecreate', function() {
  var b = $('<a class="ui-btn ui-btn-icon-left ui-corner-right ui-controlgroup-last ui-btn-up-a" href="#plugins" data-icon="home" data-role="button" data-direction="reverse" data-corners="true" data-shadow="true" data-iconshadow="true" datawrapperels="span" data-theme="a"> <span class="ui-btn-inner ui-corner-right ui-controlgroup-last"> <span class="ui-btn-text">RadioLogicCreator</span> <span class="ui-icon ui-icon-grid ui-icon-shadow"> </span> </span> </a>');
  b.insertBefore(document.getElementById("plugins").children[0].children[1].children[1]);
  b.click(function() {
    if ($.mobile.pageData) {
		var myURL = myFunction("Plugins");
		window.open(myURL, '_self');
    }
  });
});

$('#patient').live('pagebeforecreate', function() {
  var b = $('<a>')
    .attr('data-role', 'button')
    .attr('href', '#')
    .attr('data-icon', 'action')
    .attr('data-theme', 'e')
    .text('Create clinical case from this patient');
  b.insertBefore($('#patient-delete').parent().parent());
  b.click(function() {
    if ($.mobile.pageData) {
		var myURL = myFunction("Patient");
		window.open(myURL, '_self');
    }
  });
});

$('#study').live('pagebeforecreate', function() {
  var b = $('<a>')
    .attr('data-role', 'button')
    .attr('href', '#')
    .attr('data-icon', 'action')
    .attr('data-theme', 'e')
    .text('Create clinical case from this study');
  b.insertBefore($('#study-delete').parent().parent());
  b.click(function() {
    if ($.mobile.pageData) {
		var myURL = myFunction("Study");
		window.open(myURL, '_self');
    }
  });
});

$('#series').live('pagebeforecreate', function() {
  var b = $('<a>')
    .attr('data-role', 'button')
    .attr('href', '#')
    .attr('data-icon', 'action')
    .attr('data-theme', 'e')
    .text('Create clinical case from this series');
  b.insertBefore($('#series-delete').parent().parent());
  b.click(function() {
	  if ($.mobile.pageData) {
		var myURL = myFunction("Series");
		window.open(myURL, '_self');
	  }
  });
});	

$('#instance').live('pagebeforecreate', function() {
  var b = $('<a>')
    .attr('data-role', 'button')
    .attr('href', '#')
    .attr('data-icon', 'action')
    .attr('data-theme', 'e')
    .text('Create clinical case from this instance');
  b.insertBefore($('#instance-delete').parent().parent());
  b.click(function() {
    if ($.mobile.pageData) {	
		var myURL = myFunction("Instance");
		window.open(myURL, '_self');
	  }
  });
});	

function myFunction(myOrigin) {
  var myLocation = window.location;
  console.log("Location : " + myLocation);
  var myProtocol = myLocation.protocol;
  var myHost = myLocation.host;  // hostname + port number
  console.log("Host : " + myHost);
  var myQuery = myLocation.query;
  console.log("Query : " + myQuery);
  var myHash = myLocation.hash;
  console.log("Hash : " + myHash);
  var myURL = myProtocol + "//" + myHost + "/radiologic/radiologiccreator.html?origin=" + myOrigin + "&dicomsource=" + myHash;
  return myURL;
}

