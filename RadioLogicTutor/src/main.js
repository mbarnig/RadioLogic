export function main () {
  console.log('** module main **');
}

// global variables

export const userStore = {
  userName: 'admin',  // string
  userPassword: 'admin',  // string
  iosBouncing: false,  // boolean,
  pixelRep: false, // boolean,
  dicomArchive: 'dicomdir',  // string
  userResets: 0,  // integer
  assessment: {
    sessions: [{
      name: '',
      caseNumber: 0,
      cases: [{
        name: '',
        caseStatus: ''
      }]
    }]
  }
}; // end userStore

export const userSettings = {
  userList: [],
  userID: -1,
  userLoggedIn: false,
  userLimit: 9,
  userOK: false,
  userIsAdmin: false
}; // end userSettings

export const systemSettings = {
  serverURL: 'http://orthancpi:8042'
}; // end systemSettings

export const sessionSettings = {
  currentSession: '',  // add Session Name in session file, add Session Description in all_session file
  casesInSession: 0
}; // end sessionSettings

export const caseSettings = {
  caseToLoad: '',
  diagnoseButtonText: 'Please login to submit your choice.',
  diagnosisSubmitted: false,
  observationImages: [],
  answerImage: {},
  loadedQuestion: false,
  correctAnswer: ''
}; // end caseSettings


// let info = true;
// let draggedElement = {};

export function debugLog (debugMessage) {
  // comment the next line to disable logging
  // console.log(debugMessage);
}

export function customAlert (message) {
  alert(message);
}


