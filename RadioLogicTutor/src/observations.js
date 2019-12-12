import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { caseSettings } from './main.js';


export function observations () {
  console.log('** module observations **');
}

function showObservation () {
  const element = document.getElementById('observationspanel');

  cornerstone.enable(element);
  // enable mouse Input
  cornerstoneTools.mouseInput.enable(element);
  cornerstoneTools.mouseWheelInput.enable(element);
  cornerstone.displayImage(element, caseSettings.observationImages[caseSettings.caseToLoad]);
  // enable zoom tools
  cornerstoneTools.zoom.activate(element, 4);
  cornerstoneTools.zoomWheel.activate(element);
}  // end showObservation
