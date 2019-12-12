import { enableResults, disableResults } from './results.js';
import { userStore, userSettings, caseSettings, debugLog, customAlert } from './main.js';

export function login () {
  console.log('** module login **');
} // end function login

const menuNames = ['#main', '#login', '#about', '#settings', '"#cases', '#observations', '#diagnosis', '#answer', '#results', '#help'];
let currentUser = userStore;

function toggleLogin () {
  menuNames.forEach(function (menuName) {
    const link = $(menuName).find('li a').eq(0);
    const linkText = link.text().replace('Login', 'Logout');

    link.text(linkText);
  }); // end forEach
  // change content in panel
  $('#userlogout').css('display', 'block');
  $('#userlogin').css('display', 'none');
  // change text and state of diagnoseButton
  caseSettings.diagnoseButtonText = 'Submit your choice';
  if (document.getElementById('diagnoseButton') !== undefined) {
    if (!caseSettings.diagnosisSubmitted) {
      $('#diagnoseButton').text(caseSettings.diagnoseButtonText);
      $('#diagnoseButton').button('enable');
    } // end if
  } // end if
} // end function toggleLogin

function toggleLogout () {
  menuNames.forEach(function (menuName) {
    const link = $(menuName).find('li a').eq(0);
    const linkText = link.text().replace('Logout', 'Login');

    link.text(linkText);
  }); // end forEach
  // change content in panel
  $('#userlogout').css('display', 'none');
  $('#userlogin').css('display', 'block');
  // change text and state of diagnoseButton
  caseSettings.diagnoseButtonText = 'Please login to submit your choice.';
  if (document.getElementById('diagnoseButton') !== undefined) {
    if (!caseSettings.diagnosisSubmitted) {
      $('#diagnoseButton').text(caseSettings.diagnoseButtonText);
      $('#diagnoseButton').button('disable');
    } // end if
  } // end if
} // end function toggleLogout

function signin () {
  // get name and password
  const loginName = $('#myusername').val();
  const loginPassword = $('#mypassword').val();

  debugLog('loginName : ' + loginName + ' ; loginPassword : ' + loginPassword);
  // check if radiobutton = "newuser" or "reguser" ?
  const checkedradio = $('[name="usersignin"]:radio:checked').val();

  if (checkedradio === 'new') {
    userSettings.userLoggedIn = newUser(loginName, loginPassword);
  } else {
    userSettings.LoggedIn = regUser(loginName, loginPassword);
  }  // end if-else
  if (userSettings.userLoggedIn) {
    enableResults();
    toggleLogin();
    $(':mobile-pagecontainer').pagecontainer('change', '#results');
  }  // end if userLoggedIn
}  // end function signin

function logout () {
  userSettings.userLoggedIn = false;
  disableResults();
  toggleLogout();
  resetGlobalVariables();
  // clear login fields
  $('#myusername').val('');
  $('#mypassword').val('');
  // ????? why is this code used ?????
  document.getElementById('myresets').innerHTML = '<p>The number of resets is registrated in your local user account.</p>';
  // check if user was logged in as admin
  if (userSettings.userIsAdmin) {
    disableAdmin();
  } // end if
  userSettings.userID = -1;
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
}  // end function logout

function quit () {
  if (userSettings.userIsAdmin) {
    // disable admin buttons
    disableAdmin();
  }  // end if
  userSettings.userLoggedIn = false;
  disableResults();
  toggleLogout();
  resetGlobalVariables();
  // close browser window if possible
  // prevent user to use back button in browser
  $(':mobile-pagecontainer').pagecontainer('change', '#quit');
}  // end function quit

function newUser (name, password) {
  // check if userList Object exist already in localStorage
  let nameExist = false;
  let temp = localStorage.getObj('userList');

  if (!temp) {
    temp = initUserObject();
  }  // end if !temp
  if (temp) {
    // check if the user number limit is not exceeded
    if (temp.length > userSettings.userLimit) {
      customAlert('The user number limit is exceeded ! Contact your administrator.');
      $('#myusername').val('');
      $('#mypassword').val('');
    } else if (name === 'admin') {
      // check if name is not admin
      customAlert('admin is a reserved name. Please chose another user name !');
      $('#myusername').val('');
      $('#mypassword').val('');
    } else if (name.length < 3 || name.length > 18 || password.length < 3 || password.length > 18) {
      // check if name length and password length are inside boundaries
      customAlert('Please enter a name and a password with at least 3 characters and with a maximum of 18 characters !');
      $('#myusername').val('');
      $('#mypassword').val('');
    } else {
      let i = 0;

      for (i; i < temp.length; i++) {  // admin is userList[0] = temp[0]
        if (name === temp[i].userName) {
          customAlert('Chose another name, this name is already registrated !');
          $('#myusername').val('');
          $('#mypassword').val('');
          nameExist = true;
          break;
        } // end if nameExist
      }  // end for i
      if (nameExist === false) {
        // save name and password
        userSettings.userID = i;
        debugLog('UserID = ' + userSettings.userID);
        userStore.userName = name;
        userStore.userPassword = password;
        temp.push(userStore);
        // restore pushed userList
        localStorage.setObj('userList', temp);
        userSettings.userLoggedIn = true;
      } else {
        // clear form fields
        debugLog('add action');
      }  // end if-else !nameExist
    }  // end if-else nameLength
  } // end if-else admin

  return userSettings.userLoggedIn;
}  // end newUser

function regUser (name, password) {
  // check if userList Object exist already in localStorage
  let temp = localStorage.getObj('userList');

  if (!temp) {
    temp = initUserObject();
  }  // end if !temp
  if (temp) {
    // check first if user or password fields are not empty
    // lint warning: comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==)
    if (name === '' || password === '') {
      customAlert('Please enter your name and password.');
    } else if (name === 'admin' && password === 'admin') {
      // check first if user is administrator and password is correct
      customAlert('You are logged in as administrator.');
      enableAdmin();
    } else {
      // check if user is registrated
      let j = 0;

      for (j; j < temp.length; j++) {
        if (name === temp[j].userName) {
          userSettings.userOK = true;
          break;
        }  // end userOK
      } // end for j
      // check password of registrated user
      if (userSettings.userOK) {
        if (password === temp[j].userPassword) {
          // login is OK
          userSettings.userLoggedIn = true;
          userSettings.userID = j;
          customize();
        } else {
          customAlert('Your password does not correspond to your username !');
          $('#mypassword').val('');
        }  // end if-else password
      } else {
        customAlert('This username is not registrated !');
        $('#myusername').val('');
        $('#mypassword').val('');
      } // end if-else userOK
    }  // end if-else admin
  }  // end if temp

  return userSettings.userLoggedIn;
}  // end function regUser

function enableAdmin () {
  userSettings.userIsAdmin = true;
  userSettings.userID = 0;
  toggleLogin();
  // make admin settings visible
  document.getElementById('admin').style.display = 'block';
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
} // end function enableAdmin

function disableAdmin () {
  userSettings.userIsAdmin = false;
  userSettings.userID = -1;
  // hide admin settings
  document.getElementById('admin').style.display = 'none';
  $(':mobile-pagecontainer').pagecontainer('change', '#main');
} // end function disableAdmin

function initUserObject () {
  userSettings.userList[0] = userStore;
  localStorage.setObj('userList', userSettings.userList);
  // update temp
  const temp = localStorage.getObj('userList');

  return temp;
}  // end function initUserObject

function customize () {
  // read and set preferences of returning user
  const temp = localStorage.getObj('userList');

  currentUser = temp[userSettings.userID];
  document.getElementById('userResets').innerHTML = '<p>The number of resets is registrated in your local user account. Current value : ' + userStore.userResets + '</p>';
  debugLog('Customizations');
  debugLog(userStore);
} // end function customize

function resetGlobalVariables () {

} // end function resetGlobalVariables
