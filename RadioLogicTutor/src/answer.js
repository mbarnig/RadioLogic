import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { caseSettings } from './main.js';

export function answer () {
  console.log('** module answer **');
}

const menuNames = ['#main', '#login', '#about', '#settings', '"#cases', '#observations', '#images', '#diagnosis', '#answer', '#results', '#help'];

function showAnswer () {
  const element = document.getElementById('answerpanel');

  cornerstone.enable(element);
  cornerstone.displayImage(element, caseSettings.answerImage);
}  // end showAnswer

export function enableAnswer () {
  menuNames.forEach(function (menuName) {
    $(menuName + 'li:nth-child(8)').removeClass('ui-disabled').addClass('ui-enabled');
  }); // end forEach
} // end function enableAnswer

function disableAnswer () {
  menuNames.forEach(function (menuName) {
    $(menuName + 'li:nth-child(8)').removeClass('ui-enabled').addClass('ui-disabled');
  }); // end forEach
} // end function disableAnswer

