import * as dicomParser from 'cornerstone-dicom-parser-utf8';
import { userStore, caseSettings, userSettings, systemSettings, sessionSettings, customAlert } from './main.js';
import { enableAnswer } from './answer.js';

export function diagnosis () {
  console.log('** module diagnosis **');
}

function showChoices () {
  // lint warning: comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==)
  if (caseSettings.loadedQuestion === false) {
    caseSettings.loadedQuestion = true;
    // clear diagnosispanel
    document.getElementById('diagnosispanel').innerHTML = '';
    const dataSet = dicomParser.parseDicom(caseSettings.observationImages[caseSettings.caseToLoad].data.byteArray);

    // get questions
    let answerchoices = '';

    answerchoices = '<form>';
    answerchoices += '<fieldset data-role="controlgroup">';
    answerchoices += '<legend>Your Diagnosis :</legend>';
    let i = 0;

    // while (dataSet.stringUTF8("x4321101" + i) !== undefined) {
    while (dataSet.string('x4321101' + i) !== undefined) {
      answerchoices += "<input type='radio' name='answer' id='b" + i + "' value='Button0" + (i + 1) + "'>";
      // answerchoices += "<label for='b" + i + "'>" + dataSet.stringUTF8('x4321101' + i) + "</label>";
      answerchoices += "<label for='b" + i + "'>" + dataSet.string('x4321101' + i) + "</label>";
      i++;
    }  // end while
    answerchoices += '</fieldset>';
    answerchoices += '</form>';
    // check if user is logged in
    answerchoices += "<button id='diagnoseButton' class='ui-btn ui-btn-inline' onclick='diagnose()'>" + caseSettings.diagnoseButtonText + "</button>";
    $('#diagnosispanel').append(answerchoices);
    $('input[type=radio]').checkboxradio().trigger('create');
    $('#diagnoseButton').button();
    // check if user is logged in
    if (userSettings.userLoggedIn) {
      $('#diagnoseButton').button('enable');
    } else {
      $('#diagnoseButton').button('disable');
    } // end if-else userLoggedIn

    // load answer file
    if (userStore.archive === 'ziparchive') {
      loadAnswerFileFromDicomdirArchive();
    } else {
      loadAnswerFileFromServer(systemSettings.serverURL);
    }  // end if-else
  }  // end if loadedQuestion
} // end function showChoices

function loadAnswerFileFromDicomdirArchive () {

}  // end function loadAnswerFileFromDicomdirArchive

function loadAnswerFileFromServer (url) {

}  // end function loadAnswerFileFromServer

// enable "Diagnosis button" only if user is logged in
// show text on diagnosis button to login if not
// disable "Diagnosis button" if diagnosis has been submitted
// show alert box if answer is correct or false

function diagnose () {
  // read selected choice
  let userAnswer = '';
  const selectedChoice = $('[name="answer"]:radio:checked').val();

  if (selectedChoice === undefined) {
    customAlert('Please push a radio button to define your choice !');
  } else {
    userAnswer = selectedChoice;
    if (userAnswer === caseSettings.correctAnswer) {
      changeCaseStatus('correct');
      customAlert('Congratulations!\nYour diagnose is correct.\nView the details on the next page.');
    } else {
      changeCaseStatus('wrong');
      customAlert('Sorry!\nYour answer is wrong.\nView the correct diagnosis on the next page.');
    } // end if-else correctAnswer
    caseSettings.diagnosisSubmitted = true;
    caseSettings.diagnoseButtonText = 'This diagnosis has been submitted.';
    if (document.getElementById('diagnoseButton') !== undefined) {
      $('#diagnoseButton').text(caseSettings.diagnoseButtonText);
      $('#diagnoseButton').button('disable');
	} // end if
    enableAnswer();
    $(':mobile-pagecontainer').pagecontainer('change', '#answer');
  }  // end if-else selcetdChoice
} // end function diagnose

function changeCaseStatus (caseStatus) {
  // update case status in assessment
  let jump = false;
  const temp = localStorage.getObj('userList');
  const sessionCount = temp[userSettings.userID].assessment.sessions.length;

  for (let j = 0; j < sessionCount; j++) {
    if (temp[userSettings.userID].assessment.sessions[j].name === sessionSettings.currentSession) {
      const caseCount = temp[userSettings.userID].assessment.sessions[j].cases.length;

      for (let i = 0; i < caseCount; i++) {
        if (temp[userSettings.userID].assessment.sessions[j].cases[i].name === caseSettings.caseToLoad) {
          temp[userSettings.userID].assessment.sessions[j].cases[i].caseStatus = caseStatus;
          localStorage.setObj('userList', temp);
          jump = true;
          break; // jump out from i Loop
        }  // end if caseToLoad
      }  // end for i loop
    }  // end if session
    if (jump) {
      break; // jump out from j Loop
    } // end if jump
  } // end for j loop
} // end function changeCaseStatus
