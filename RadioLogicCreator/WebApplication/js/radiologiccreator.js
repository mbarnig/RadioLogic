// RadioLogicCreator project
// copyright 2019 Marco Barnig, Luxembourg
// version 1.1.1
/*jshint esversion: 8 */ 
(function () {
  'use strict';
  // this function is strict...
}());

// global variables
var uploadMode = false;
var observationImageReady = false;
var observationImageBase64 = "";
var answerImageReady = false;
var answerImageBase64 = "";
var observationImageFile;
var answerImageFile;
var dicomFileList = [];
var caseResources = [];
var dicomInstancesList = [];
var scrambleKey = "4321";
var possibleDiagnosesString = "";
var encodedDiagnosis = "";
var dropzone = document.getElementById("dropzone");
var listing = document.getElementById("dicom-file-list");
var historyObj = window.history;
console.log(historyObj);
var currentProtocol = window.location.protocol;
console.log("currentProtocol: " + currentProtocol);
var currentHost = window.location.host;
console.log("currentHost: " + currentHost);
var serverUrlPrefix = currentProtocol + "//" + currentHost;

// https://css-tricks.com/prefilling-data-input/
var today = yyyymmdd();
console.log("Date: " + today);

$('document').ready(function(){
  $('#scramble-key').parent().width($('#scramble-key').parent().width() * 0.4);
  $('#correct-diagnosis').parent().width($('#correct-diagnosis').parent().width() * 0.4);
  $('#dicom-resource-type').parent().width($('#dicom-resource-type').parent().width() * 0.76);
  $('#clinical-case-author').parent().width($('#clinical-case-author').parent().width() * 0.76);
  $('#clinical-case-date').parent().width($('#clinical-case-date').parent().width() * 0.4);
});  // end document ready

$(document).on("mobileinit", function() {
  //set theme
  $.mobile.page.prototype.options.theme = "b";
});

$('#info-text').prop('readOnly', true);
$('#clinical-case-date').val(today);
var myHash = window.location.hash;
console.log(myHash);
var dicomType = myHash.substring(myHash.lastIndexOf("#") + 1, myHash.lastIndexOf("?"));
console.log(dicomType);
if(dicomType == "patient" || dicomType == "study" || dicomType == "series" || dicomType == "instance") {
  var myId = myHash.substring(myHash.lastIndexOf("=") + 1);
  console.log(myId);
  // display dicomType and myUuid
  $('#dicom-resource-type').val(dicomType);
  $('#dicom-resource-type').removeClass('ui-disabled');
  $('#dicom-resource-id').val(myId);
  $('#dicom-resource-id').removeClass('ui-disabled');
}

$('#observationImage').change(function() {
  // http://jsfiddle.net/DSARd/1/
  observationImageFile = $('#observationImage')[0].files[0];
  $("#previewObservation").empty();
  displayAsImage3(observationImageFile, "previewObservation");
  var reader = new FileReader();
  reader.onloadend = function() {
    observationImageBase64 = reader.result;
    // console.log("observationImageBase64: " + observationImageBase64);
  };
  reader.readAsDataURL(observationImageFile);
  observationImageReady = true;
});

$('#chooseObservationFile').click(function() {
  $('#observationImage').click();
});

$('#answerImage').change(function() {
  answerImageFile = $('#answerImage')[0].files[0];
  console.log("AnswerImageFile: " + answerImageFile);
  console.log("AnswerImageFileName: " + answerImageFile.name);
  console.log("answerImage selected");
  $("#previewAnswer").empty();
  displayAsImage3(answerImageFile, "previewAnswer");
  var img = new Image();
  img.onload = function(){
    var canvas = document.getElementById('canvasAnswer');
    canvas.style.display="none";
    canvas.width = 960;
    canvas.height = 640;
    console.log("Image loaded");
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0,0);
    var result = scrambleAnswerImage(canvas, scrambleKey);
    console.log("Result returned from ScrambleAnswerImage");
    console.log(result);
    if(result[0] == true) {
      answerImageBase64 = result[1].toDataURL();
      // console.log("answerImageBase64: " + answerImageBase64);
      answerImageReady = true;
    } else {
      console.log("Scramble Error");
    }
  };
  img.src = URL.createObjectURL(answerImageFile);
});

function scrambleAnswerImage(canvas, key) {
  try {
    var scrambledImage = ImageScrambler.scramble(canvas, key);
    console.log("Scrambled Image: " + scrambledImage);
    return [true, scrambledImage];
  } catch(e) {
    console.log("Scramble error: " + e);
    return [false];
  }
}

$('#chooseAnswerFile').click(function() {
  $('#answerImage').click();
});

/*
$('#dicomFolder').change(function() {
  var file = $('#dicomFolder')[0].files[0];
});
*/

$('#chooseDicomFolder').click(function() {
  $('#dicomFolder').click();
});

$('#dicom-files-stored').click(function() {
  // desactivate upload elements
  $('#chooseDicomFolder').addClass('ui-disabled');
  $('#dropzone').css('opacity', 0.3);
  $('#boxtitle').css('opacity', 0.3);
  $('#listing').css('opacity', 0.3);
  // change uploadMode
  uploadMode = false;
});

$('#dicom-files-upload').click(function() {
  // activate upload elements
  $('#chooseDicomFolder').removeClass('ui-disabled');
  $('#dropzone').css('opacity', 1.0);
  $('#boxtitle').css('opacity', 1.0);
  $('#listing').css('opacity', 1.0);
  // change uploadMode
  uploadMode = true;
});

async function scanFiles(item, container) {
  var elem = document.createElement("li");
  elem.innerHTML = item.name;
  container.appendChild(elem);
  if (item.isDirectory) {
    var directoryReader = item.createReader();
    var directoryContainer = document.createElement("ul");
    container.appendChild(directoryContainer);
    directoryReader.readEntries(function(entries) {
      entries.forEach(function(entry) {
        scanFiles(entry, directoryContainer);
      });
    });
  } else {
    console.log(item.fullPath);
    var dicomFile = await getFile(item);
    console.log(dicomFile);
    dicomFileList.push(dicomFile);
  }
}

async function getFile(fileEntry) {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
  } catch (err) {
    console.log(err);
  }
}

dropzone.addEventListener("dragover", function(event) {
  event.preventDefault();
}, false);

dropzone.addEventListener("drop", function(event) {
  let items = event.dataTransfer.items;
  event.preventDefault();
  // clear listing and dicomFileList[] when files have been dropped
  listing.innerHTML = "";
  dicomFileList = [];
  for (let i=0; i<items.length; i++) {
    let item = items[i].webkitGetAsEntry();
    if (item) {
      scanFiles(item, listing);
    }
  }
}, false);

function validation() {
  var validationError = false;
  var validationWarning = false;
  var validationMessage = "";
  var dicomFilesSelected = false;
  // required DICOM files
  if(uploadMode == true) {
    if(dicomFileList.length == 0) {
      $(document).simpledialog2({
      mode: 'blank',
      themeHeader: 'b',
      themeDialog: 'a',
      headerText: false,
      headerClose: false,
      blankContent :
      '<div style="text-align:center">' +
      '<p>Please select DICOM files to upload to Orthanc Server.</p>' +
      '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Close</a>' +
      '</div>'
      });
      // alert("Please select DICOM files to upload to Orthanc Server");
    } else {
      dicomFilesSelected = true;
    }
  } else {
    let dicomResourceType = $('#dicom-resource-type').val();
    let dicomResourceId = $('#dicom-resource-id').val();
    if(dicomResourceType == "" || dicomResourceId == "") {
      $(document).simpledialog2({
      mode: 'blank',
      themeHeader: 'b',
      themeDialog: 'a',
      headerText: false,
      headerClose: false,
      blankContent :
      '<div style="text-align:center">' +
      '<p>Please select Patient, Study, Series or Instance in Orthanc Lookup.</p>' +
      '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Close</a>' +
      '</div>'
      });
      // alert("Please select Patient, Study, Series or Instance in Orthanc Lookup.");
    } else {
      getDicomInstancesListFromServer(dicomResourceType, dicomResourceId);
      dicomFilesSelected = true;
    }
  }
  if(dicomFilesSelected == true) {
  // required input
  let clinicalCaseName = $('#clinical-case-name').val();
  if(clinicalCaseName == "") {
    validationError = true;
    validationMessage ="* Error: clinical case name not specified \n";
  } else {
    clinicalCaseName = "RadioLogic " + $('#clinical-case-name').val();
    console.log("clinicalCaseName: " + clinicalCaseName);
  }
  let correctDiagnosis = $('#correct-diagnosis').val();
  if(correctDiagnosis == "") {
    validationError = true;
    validationMessage += "* Error: correct diagnosis not defined \n";
  } else {
    console.log("correctDiagnosis: " + correctDiagnosis);
    // check if possibleDiagnosis filed specified by correctDiagnosis index is not empty
    let correctDiagnosisText =  document.getElementById("diagnosis-" + correctDiagnosis).value;
    if(correctDiagnosisText == "") {
      validationError = true;
      validationMessage += "* Error: correct Diagnosis field is empty! \n";
    } else {
      // obfuscate correctDiagnosisText
      encodedDiagnosis = b64EncodeUnicode(correctDiagnosisText);
    }
  }
  // https://mburakerman.com/numscrubberjs/
  let scrambleKey = $('#scramble-key').val();
  if(scrambleKey == "") {
    validationError = true;
    validationMessage += "* Error: scramble key not defined \n";
  } else {
    console.log("scrambleKey: " + scrambleKey);
  }
  var possibleDiagnoses = [];
  var counter = 0;
  for (var i = 0; i < 10; i++) {
    let diagnosis =  document.getElementById("diagnosis-" + i).value;
    possibleDiagnoses[i] = diagnosis;
    if (diagnosis != "") {
      counter++;
    }
  }
  if(counter < 2) {
    validationError = true;
    validationMessage += "* Error: two possible diagnoses at least must be defined \n";
  } else {
    console.log("possibleDiagnoses: " + possibleDiagnoses);
    possibleDiagnosesString = possibleDiagnoses.toString();
  }
  if(observationImageReady == false) {
    validationError = true;
    validationMessage += "* Error: no observation image selected \n";
  } else {
    console.log("Observation image name: " + observationImageFile);
  }
  if(answerImageReady == false) {
    validationError = true;
    validationMessage += "* Error: no answer image selected \n";
  } else {
    console.log("Answer image name: " + answerImageFile);
  }
  // optional input
  let clinicalCaseAuthor = $('#clinical-case-author').val();
  if(clinicalCaseAuthor == "") {
    validationWarning = true;
    validationMessage += "# Warning: clinical case author is not specified \n";
  } else {
    console.log("clinicalCaseAuthor: " + clinicalCaseAuthor);
  }
  let clinicalCaseDescription = $('#clinical-case-description').val();
  if(clinicalCaseDescription == "") {
    validationWarning = true;
    validationMessage += "# Warning: clinical case description is not specified \n";
  } else {
    console.log("clinicalCaseDescription: " + clinicalCaseDescription);
  }
  let clinicalCaseDate = $('#clinical-case-date').val();
  if(clinicalCaseDate == today) {
    validationWarning = true;
    validationMessage += "+ Info: clinical case date is current date \n";
  } else {
    console.log("clinicalCaseDate: " + clinicalCaseDate);
  }
  if(validationError == true) {
    updateMessagePanel("Please check the following warnings or errors: \n" + validationMessage);
    // display popup window with warning message
    $(document).simpledialog2({
      mode: 'blank',
      themeHeader: 'b',
      themeDialog: 'a',
      headerText: 'Validation?',
      headerClose: false,
      blankContent :
      '<div style="text-align:center">' +
      '<p>The entered data is not valid. Check the message panel for details.</p>' +
      '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Close</a>' +
      '</div>'
    });
  } else {
    caseResources = {
      "ClinicalCaseName" : clinicalCaseName,
      "ClinicalCaseAuthor" : clinicalCaseAuthor,
      "ClinicalCaseDescription" : clinicalCaseDescription,
      "ClinicalCaseDate" : clinicalCaseDate,
      "PossibleDiagnoses" : possibleDiagnosesString,
      "CorrectDiagnosis" : encodedDiagnosis,
      "ScrambleKey" : scrambleKey,
      "DicomInstancesList" : "",
      "ObservationId" : "",
      "AnswerId" : ""
    };
    if(validationWarning == true) {
      updateMessagePanel("Please check the following warnings: \n" + validationMessage);
      $(document).simpledialog2({
        mode: 'blank',
        themeHeader: 'b',
        themeDialog: 'a',
        headerText: 'Validation?',
        headerClose: false,
        blankContent :
        '<p>Are you sure that all entries are valid?</p>' +
        '<a rel="close" style="border-radius: 1.75em; background-color:orange; color:white" data-role="button" href="#" onclick="enableSubmission()">Confirm</a>' +
        '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Cancel</a>'
      });
    } else {
      updateMessagePanel("Congratulations: your entered data seems to be valid.");
      $(document).simpledialog2({
        mode: 'blank',
        themeHeader: 'b',
        themeDialog: 'a',
        headerText: 'Validation?',
        headerClose: false,
        blankContent :
        '<p>Are you sure that all entries are valid?</p>' +
        '<a rel="close" style="border-radius: 1.75em; background-color:orange; color:white" data-role="button" href="#" onclick="enableSubmission()">Confirm</a>' +
        '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Cancel</a>'
      });
    }
    } // end validation error
  } // end dicom Files selected
} // end validation

function updateMessagePanel(message) {
  $('#info-text').val(message);
}

function enableSubmission() {
  $('#validation').addClass('ui-disabled');
  $('#submission').removeClass('ui-disabled');
}

function makeDicomFileList() {
  console.log("makeDicomFileList");
  // clear dicomFileList[] when files have been selected
  dicomFileList = [];
  listing.innerHTML = "";
  let directoryContainer = document.createElement("ul");
  listing.appendChild(directoryContainer);
  let input = document.getElementById('dicomFolder');
  for (var i = 0; i < input.files.length; i++) {
    var dicomFile = input.files[i];
    console.log("dicomFileName: " + dicomFile.name);
    dicomFileList.push(dicomFile);
    let elem = document.createElement("li");
    elem.innerHTML = dicomFile.name;
    listing.appendChild(elem);
  }
}

function readAndUploadDicomFiles(file) {
  var instancesUrl = serverUrlPrefix + "/instances";
  const temporaryFileReader = new FileReader();
  return new Promise((resolve, reject) => {
    temporaryFileReader.onload = () => {
      // const dicomArrayBuffer = temporaryFileReader.result;
      const options = {
        method: 'post',
        body: file
      };
      fetch(instancesUrl, options)
      .then(result => {
        const jsonResult = result.json();
        resolve(jsonResult);
      })
      .catch(error => {
        reject(error);
      });
    };
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(temporaryFileReader.error);
    };
    temporaryFileReader.readAsArrayBuffer(file);
  });
}

function submission() {
  $('#validation').addClass('ui-disabled');
  $('#submission').addClass('ui-disabled');
  clearInputFields();
  // display popup window with waiting message
  $(document).simpledialog2({
    mode: 'blank',
    themeHeader: 'b',
    themeDialog: 'a',
    headerText: 'Uploading',
    headerClose: false,
    blankContent :
    '<div style="text-align:center">' +
    '<p>Please wait</p>' +
    '<img src="images/ajax-loader.gif" alt="loading" width="200" height="200" />' +
    //  '<a rel="close" data-role="button" href="#">Cancel</a>' +
    '</div>'
  });
  // upload dicom Files
  if (uploadMode == true) {
    Promise.all(dicomFileList.map(dicomFile => readAndUploadDicomFiles(dicomFile)))
    .then(function(values) {
      console.log(values);
      // clear dicomInstancesList
      dicomInstancesList = [];
      values.forEach(fillDicomInstancesList);
      var start = startRadioLogicCreationJob();
      console.log("Start after upload: " + start);
      if (start == "Success") {
        showjobs();  
      } 
    });
  } else {
    var start = startRadioLogicCreationJob();
    console.log("Start direct: " + start);
  }
  $('#validation').removeClass('ui-disabled');
}

function fillDicomInstancesList(item, index) {
  console.log("dicomFileId: " + item.ID);
  dicomInstancesList.push(item.ID);
}

function showjobs() {
  var jobUrl = serverUrlPrefix + "/app/explorer.html#jobs";
  window.location.href = jobUrl;
}

function displayAsImage3(file, containerid) {
  if (typeof FileReader !== "undefined") {
    var container = document.getElementById(containerid),
    img = document.createElement("img"), reader;
    container.appendChild(img);
    reader = new FileReader();
    reader.onload = (function (theImg) {
      return function (evt) {
        theImg.src = evt.target.result;
      };
    }(img));
    reader.readAsDataURL(file);
  }
}  // end displayAsImage3

async function getDicomInstancesListFromServer(dicomType, dicomId) {
  var ok = true;
  var url = "";
  switch(dicomType) {
    case "patient":
    url = serverUrlPrefix + "/patients/" + dicomId + "/instances";
    break;
    case "study":
    url = serverUrlPrefix + "/studies/" + dicomId + "/instances";
    break;
    case "series":
    url = serverUrlPrefix + "/series/" + dicomId + "/instances";
    break;
    case "instance":
    url = serverUrlPrefix + "/instances/" + dicomId;
    break;
    default:
    // print error message
    console.log("an error occurred in switch statement");
    ok = false;
  }  // end switch
  if(ok == true) {
    // get list of instances
    try {
      let response = await fetch(url);
      console.log("Response received from Instances request");
      console.log(response);
      if(response.ok == true) {
        let data = await response.json();
        console.log("Data received from Instances request");
        console.log(JSON.stringify(data));
        let type = Object.prototype.toString.call(data);
        console.log("JSON type: " + type);
        if(type === '[object Array]') {
          data.forEach(item => {
          console.log(item.ID);
          dicomInstancesList.push(item.ID);
          });
        } else {
          console.log(data.ID);
          dicomInstancesList.push(data.ID);
        }
        let success = [true, dicomInstancesList];
        return success;
      } else {
        return "creation of DicomInstancesList failed";
      }
    } catch(error) {
      console.log(error);  // Handle the error response object
      return "creation of DicomInstancesList failed";
    }
  }  // end if
}

async function createObservationDicomFile(patientName) {
  console.log("create Observation DICOM file");
  var createDicomUrl = serverUrlPrefix + "/tools/create-dicom";
  try {
    let response = await fetch(createDicomUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
      'Tags':{
        'PatientName' : patientName,
        'Modality' : 'OS',
        'SOPClassUID' : '1.2.840.10008.5.1.4.1.1.1'},
      'Content' : observationImageBase64
      })
    });
    if(response.ok == true) {
      let data = await response.json();
      console.log("ObservationDicomFile created");
      console.log("observationDicomFileId: " + data.ID);  // get the Uuid of the ObservationDicomFile
      caseResources.ObservationId = data.ID;
    } else {
      console.log("The creation of the observationDicomFile failed");
    }
  } catch(error) {
    console.log("The creation of the observationDicomFile failed: " + error); // Handle the error response object
  }
}

async function createAnswerDicomFile(patientName) {
  console.log("create Answer DICOM file");
  var createDicomUrl = serverUrlPrefix + "/tools/create-dicom";
  try {
    let response = await fetch(createDicomUrl, {
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({
      'Tags':{
        'PatientName' : patientName,
        'Modality' : 'OS',
        'SOPClassUID' : '1.2.840.10008.5.1.4.1.1.1'},
      'Content' : answerImageBase64
      })
    });
    if(response.ok == true) {
      let data = await response.json();
      console.log("AnswerDicomFile created");
      console.log("answerDicomFileId: " + data.ID);  // get the Uuid of the answerDicomFile
      caseResources.AnswerId = data.ID;
    } else {
      console.log("The creation of the answerDicomFile failed");
    }
  } catch(error) {
    console.log("The creation of the answerDicomFile failed: " + error);  // Handle the error response object
  }
}

async function startRadioLogicCreationJob() {
  // upload Observation and Answer DICOM files
  // wait for observation response
  let responseObservation = await createObservationDicomFile(caseResources.ClinicalCaseName);
  console.log("responseObservation: " + responseObservation);
  // wait for answer response
  let responseAnswer = await createAnswerDicomFile(caseResources.ClinicalCaseName);
  console.log("responseAnswer: " + responseAnswer);
  caseResources.DicomInstancesList = dicomInstancesList.toString();
  // let jsonObject = Object.assign(caseResources, dicomInstancesList);
  console.log("caseResources content: " + JSON.stringify(caseResources));
  var startJobUrl = serverUrlPrefix + "/ralo/startjob";
  try {
    let response = await fetch(startJobUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(caseResources)
    });
    if(response.ok == true) {
      let data = await response.json();
      console.log("Job started");
      console.log("Data: " + data);
      // close popup window with spinning wheel
      $.mobile.sdCurrentDialog.close();
      return("Success");
    } else {
      startFailure();
      return "The jobstart failed";
    }
  } catch(error) {
    console.log(error);  // Handle the error response object
    startFailure();
    return "The jobstart failed";
  }
}

function startFailure() {
  $.mobile.sdCurrentDialog.close();
  // display popup window with warning message
  $(document).simpledialog2({
    mode: 'blank',
    themeHeader: 'b',
    themeDialog: 'a',
    headerText: 'Upload Error',
    headerClose: false,
    blankContent :
    '<div style="text-align:center">' +
    '<p>Check the network settings!</p>' +
    '<a rel="close" style="border-radius: 1.75em; background-color:#3388cb; color:white" data-role="button" href="#">Close</a>' +
    '</div>'
  });
}

/*
 * LCG.js - A linear congruential generator implementation
 * @author jpcarzolio
 */
var LCG = (function() {
  "use strict";
  var LCG = function(seed) {
    this.state = seed;
  };
  var a = 1664525,
      c = 1013904223,
      m = 4294967296;
  LCG.prototype.rand = function() {
    this.state = (this.state * a + c) % m;
    return this.state / m;
  };
  LCG.prototype.intBetween = function(min, max) {
    return min + Math.round(this.rand() * (max - min));
  };
  return LCG;
})();

/**
 * ImageScrambler.js
 * Implementation of an algorithm to scramble and unscramble an image using
 * a specified integer key.
 * This method can be thought of as a weak graphical encryption process.
 * Image dimensions must be multiples of the block size (by default, 8).
 * @author jpcarzolio
*/
var ImageScrambler = (function() {
  "use strict";
  /*
   * Creates a randomly shuffled vector (using LCG and the given seed) containing
   * all integers between 0 and n - 1, swapping values and keys if reverse is set
   * to true.
   */
  var getScramblerVector = function(n, seed, reverse) {
    var v = [], i;
    for (i = 0; i < n; i++) {
      v[i] = i;
    }
    var rnd = new LCG(seed);
    var out = [];
    var max = n - 1;
    var p;
    for (i = 0; i < n; i++) {
      p = rnd.intBetween(0, max);
      out[i] = v[p];
      v[p] = v[max];
      max--;
    }
    if (reverse) {
      var out2 = [];
      for (i = 0; i < n; i++) {
        out2[out[i]] = i;
      }
      out = out2;
    }
    return out;
  };
  /**
   * Slices the given image (HTMLCanvasElement) into bxb sized blocks and
   * reorders them according to the specified scrambler vector
   * (permutation), returning the resulting image.
   */
  var processImage = function(img, sv, b) {
    var w = img.width;
    var h = img.height;
    var n = (w * h) / (b * b);
    if (n != sv.length) throw new UserException("Invalid scramble vector size");
    var imgOut = document.createElement('canvas');
    imgOut.width = img.width;
    imgOut.height = img.height;
    var ctx = imgOut.getContext("2d");
    for (var i = 0; i < n; i++) {
      var sx = (i * b) % w;
      var sy = Math.floor((i * b) / w) * b;
      var dx = (sv[i] * b) % w;
      var dy = Math.floor((sv[i] * b) / w) * b;
      ctx.drawImage(img, sx, sy, b, b, dx, dy, b, b);
    }
    return imgOut;
  };
  return {
    /** Scrambles (or unscrambles, if reverse is true) the given image using the given key */
    scramble: function(img, seed, reverse) {
      var b = 8;
      var n = (img.width * img.height) / (b * b);
      var sv = getScramblerVector(n, seed, reverse);
      return processImage(img, sv, b);
    },
    /** Unscrambles the given image using the given key */
    unscramble: function(img, seed) {
      return ImageScrambler.scramble(img, seed, true);
    }
  };
})();

function UserException(message) {
  console.log("Exception: " + message);
}

function clearInputFields() {
  $('#clinical-case-author').val("");
  $('#clinical-case-name').val("");
  $('#clinical-case-description').val("");
  $('#dicom-resource-type').val("");
  $('#dicom-resource-id').val("");
  $('#info-text').val("");
  $('#clinical-case-date').val(today);
  $('#diagnosis-0').val("");
  $('#diagnosis-1').val("");
  $('#diagnosis-2').val("");
  $('#diagnosis-3').val("");
  $('#diagnosis-4').val("");
  $('#diagnosis-5').val("");
  $('#diagnosis-6').val("");
  $('#diagnosis-7').val("");
  $('#diagnosis-8').val("");
  $('#diagnosis-9').val("");
  $('#observationImage').val("");
  $('#answerImage').val("");
  $('#correct-diagnosis').val("");
  $('#scramble-key').val("");
}

function b64EncodeUnicode(str) {
  // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
  function toSolidBytes(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

function orthanc() {
  var orthancUrl = serverUrlPrefix + "/app/explorer.html";
  console.log("orthancUrl: " + orthancUrl);
  window.location.href = orthancUrl;
}

// https://codereview.stackexchange.com/questions/184459/getting-the-date-on-yyyymmdd-format
function yyyymmdd() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var mm = m < 10 ? '0' + m : m;
    var dd = d < 10 ? '0' + d : d;
    return '' + y + mm + dd;
}
