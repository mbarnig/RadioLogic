$('#series').live('pagebeforecreate', function() {
  var b = $('<a>')
    .attr('data-role', 'button')
    .attr('href', '#')
    .attr('data-icon', 'action')
    .attr('data-theme', 'e')
    .text('Scale images from this series to 50%');
  b.insertBefore($('#series-delete').parent().parent());
  b.click(function() {
    if ($.mobile.pageData) {
      var myURL = myFunction();
      console.log("URL : " + myURL);
      fetch(myURL).then(function(response) {
        return response.text().then(function(text) {
          console.log("Response: " + text);
          if(text == "OK") {
            // close popup-window wait with spinning wheel
            $.mobile.sdCurrentDialog.close();
          }
        });
      });
    }
  });
});

function myFunction() {
  var myLocation = window.location;
  console.log("Location : " + myLocation);
  var myProtocol = myLocation.protocol;
  var myHost = myLocation.host;  // hostname + port number
  console.log("Host : " + myHost);
  var myQuery = myLocation.query;
  console.log("Query : " + myQuery);
  var myHash = myLocation.hash;
  console.log("Hash : " + myHash);
  var myURL = myProtocol + "//" + myHost + "/series/" + myHash.split('=')[1]  + "/scale";
  // display popup window with waiting message and spinning wheel
  $(document).simpledialog2({
    mode: 'blank',
    themeHeader: 'b',
    themeDialog: 'a',
    headerText: 'Scaling',
    headerClose: false,
    blankContent :
    '<div style="text-align:center">' +
    '<p>Please wait</p>' +
    '<img src="' + myProtocol + '//' + myHost + '/radiologic/images/ajax-loader.gif" alt="loading" width="200" height="200" />' +
    '</div>'
  });
  return myURL;
}

