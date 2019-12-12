import { userStore, userSettings, customAlert } from './login.js';
import * as iNoBounce from 'inobounce';

export function settings () {
  console.log('** module settings **');
}

function updateRadioButtons () {
  if (userStore.archive === '') {
    $('#publicserver').prop('checked', true).checkboxradio('refresh');
    $('#orthancmac').prop('checked', false).checkboxradio('refresh');
  } else {
    $('#publicserver').prop('checked', false).checkboxradio('refresh');
    $('#orthancmac').prop('checked', true).checkboxradio('refresh');
  } // end if-else
  // systemPreferences
  $('#iosbouncing').prop('checked', userStore.iosBouncing).checkboxradio('refresh');
  $('#pixelrep').prop('checked', userStore.pixelRep).checkboxradio('refresh');
} // end function updateRadioButtons

function applyServerSettings () {
  const checkedRadio = $('[name="serversettings"]:radio:checked').val();

  switch (checkedRadio) {
  case 'publicserver' :
    userStore.archive = 'a';
    break;
  case 'orthancmac' :
    userStore.archive = 'b';
    break;
  case 'orthancpi' :
    userStore.archive = 'c';
    break;
  default :
    break;
  } // end switch
  $('#server').collapsible('collapse');
  $(':mobile-pagecontainer').pagecontainer('change', '#main');

  return userStore.archive;
}  // end function applyServerSettings

function saveServerSettings () {
  userStore.archive = applyServerSettings();
  if (userSettings.userLoggedIn) {
    const temp = localStorage.getObj('userList');

    temp[userSettings.userID].archive = userStore.archive;
    localStorage.setObj('userList', temp);
  } else {
    customAlert('You must login to save the server settings !');
  } // end if-else userLoggedIn
} // end function saveServerSettings

function manageUsers () {
  const checkedRadio = $('[name="useradmin"]:radio:checked').val();

  switch (checkedRadio) {
  case 'show' :
    // show users
    showUsers();
    break;
  case 'del' :
    // delete user with name
    deleteUser();
    break;
  case 'delall' :
    // delete all users
    deleteAllUsers();
    break;
  default :
    break;
  }  // end switch
}  // end function manageUsers

function showUsers () {
  // show all users
  const temp = localStorage.getObj('userList');
  let userName = [];
  let userPassword = [];

  if (temp) {   // admin is userList[0]
    let listusers = '<p>The names of the registrated users are listed below :<br/>';

    for (let i = 0; i < temp.length; i++) {
      userName[i] = temp[i].userName;
      listusers += i + ' :  ' + userName[i] + '<br/>';
    }  // end for i
    listusers += '</p>';
    $('#displayusers').html(listusers);
    $('#admin').collapsible('expand');
  }  // end if temp
} // end function showUsers

function deleteUser () {
  let userExist = false;
  const temp = localStorage.getObj('userList');
  let userName = [];
  const delName = $('#userdel').val();

  if (temp) {   // admin is userList[0]
    if (delName === 'admin') {
      customAlert('You can\'t delete user admin !');
    } else {
      for (let i = 1; i < temp.length; i++) {
        userName[i] = temp[i].userName;
        if (userName[i] === delName) {
          // remove name from userlist
          temp.splice(i, 1);
          localStorage.setObj('userList', temp);
          userExist = true;
          // clear search field
          $('#userdel').val('');
          showUsers();
          break;
        } // end if userName
      } // end for i
      if (!userExist) {
        // name was not found
        customAlert('This name doesn\'t exist in the user list.');
      } // end if !userExist
    }  // end-if admin
  }  // end-if temp
} // end function deleteUser

function deleteAllUsers () {
  let temp = localStorage.getObj('userList');

  if (temp) {
    // clear admin account
    // ????? why this clearing   ??????
    temp[0].diagnosesSubmitted = '';
    temp[0].casesPending = '';
    temp[0].diagnosesCorrect = '';
    temp[0].sessionsCompleted = '';
    temp[0].sessionsPending = '';
    temp[0].sessionsCorrect = '';
    // delete other users
    temp.splice(1, (temp.length - 1));
    localStorage.setObj('userList', temp);
  }
  $('#displayusers').html('');
  $('#admin').collapsible('collapse');
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
} // end function deleteAllUsers

function userReset () {
  if (userSettings.userLoggedIn) {
    const temp = localStorage.getObj('userList');
    // increment userResets
    // lint warning: increment (++) and decrement (--) operators used as part of greater statement
    let resets = temp[userSettings.userID].userResets;

    resets++;
    temp[userSettings.userID].assessment = { sessions: [{ name: '', cases: [{ name: '', caseStatus: '' }] }] };
    localStorage.setObj('userList', temp);
    document.getElementById('myresets').innerHTML = '<p>The number of resets is registrated in your local user account. Current value : ' + (resets + 1) + '</p>';
  } else {
    customAlert('You must login to reset your account !');
  }
  $('#reset').collapsible('collapse');
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
} // end function userReset

function applySystemSettings () {
  if ($('#iosbouncing').is(':checked')) {
    userStore.iosBouncing = true;
    // enable noBounce on iOS
    iNoBounce.enable();
  } else {
    userStore.iosBouncing = false;
    // disable noBounce on iOS
    iNoBounce.disable();
  } // end if-else iosBouncing
  if ($('#pixelrep').is(':checked')) {
    userStore.pixelRep = true;
  } else {
    userStore.pixelRep = false;
  } // end if-else pixelRep
  $('#system').collapsible('collapse');
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
} // end function applySystemSettings

function saveSystemSettings () {
  applySystemSettings();
  if (userSettings.userLoggedIn) {
    const temp = localStorage.getObj('userList');

    temp[userSettings.userID].iosBouncing = userStore.iosBouncing;
    temp[userSettings.userID].pixelRep = userStore.pixelRep;
    localStorage.setObj('userList', temp);
  } else {
    customAlert('You must login to save the system settings !');
  } // end if-else userLoggedIn
} // end function saveSystemSettings

