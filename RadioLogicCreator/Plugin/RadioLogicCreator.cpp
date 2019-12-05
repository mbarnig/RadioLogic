/**
 * RadioLogic is a system to create clinical cases from real
 * DICOM files and provides a self-assessment tool to view the
 * studies, submit a diagnosis and compare the performance with
 * peers. The main components are a progressive web application
 * and an Orthanc plugin (this code) to create and serve the 
 * teaching cases.
 * Copyright (C) 2019 Marco Barnig, Luxembourg
 * Version 1.1.1
 *
 * Orthanc - A Lightweight, RESTful DICOM Store
 * Copyright (C) 2012-2016 Sebastien Jodogne, Medical Physics
 * Department, University Hospital of Liege, Belgium
 * Copyright (C) 2017-2019 Osimis S.A., Belgium
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public
 * License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied
 *  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU Affero General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Affero General
 * Public License along with this program. If not, see
 *  <http://www.gnu.org/licenses/>.
 **/

#include <json/json.h>
#include <thread>
#include <stdlib.h>
#include <sstream>
#include <iostream>
#include <fstream>
#include <string>
#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/Logging.h>
#include "RadioLogicCreator.h"
#include "RadioLogicTools.h"

// constructor
RadioLogicCreator::RadioLogicCreator(std::string jobType)
:
  OrthancPlugins::OrthancJob(jobType),
  jobName_(jobType),
  counter_(0.0),
  maxSteps_(10.0),  // maxSteps must be initialized > 0
  instancesArray_ {},  // vector, must be empty

  answerId(""),
  caseAuthor(""),
  caseDate(""),
  caseDescription(""),
  clinicalCase(""),
  correctDiagnosis(""),
  instancesList(""),
  observationId(""),
  possibleDiagnoses(""),
  scrambleKey(""),
  patientId(""),
  studyInstanceUid(""),
  seriesInstanceUid(""),
  sopInstanceUid(""),
  dicomUidPrefix("1.2.826.0.1.3680043.9.6278-"),
  dicomUidSuffix(NULL),
  dicomJsonBody(""),
  errorMessages("") {
  LOG(INFO) << "*** RadioLogicCreator Job " << jobName_ << " constructor";
  RadioLogicCreator::instancesArray_.clear();
}

// destructor
RadioLogicCreator::~RadioLogicCreator() {
  LOG(INFO) << "*** RadioLogicCreator Job destructor";
}

OrthancPluginJobStepStatus RadioLogicCreator::Step() {
OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
// maxSteps must be initialized > 0
if (RadioLogicCreator::counter_ == RadioLogicCreator::maxSteps_) {
  // close job
  LOG(INFO) << "*** Last step in job engine";
  RadioLogicCreator::counter_ = 0;
  RadioLogicCreator::instancesArray_.clear();
  // get ID's of the observation and answer templates from server
  char* observationTemplateId = OrthancPluginLookupInstance(context,
    "1.2.826.0.1.3680043.9.6278.4.296485376.1.1575478248.109302");
  LOG(INFO) << "*** observationTemplateId: " << observationTemplateId;
  char* answerTemplateId = OrthancPluginLookupInstance(context,
    "1.2.826.0.1.3680043.9.6278.4.296485376.1.1575478193.109301");
  LOG(INFO) << "*** answerTemplateId: " << answerTemplateId;
  if (observationTemplateId == NULL || answerTemplateId == NULL) {
    LOG(INFO) << "*** Observation or Answer DICOM templates are missing";
    RadioLogicCreator::errorMessages.append
     (" * Observation or Answer DICOM templates are missing");
    return OrthancPluginJobStepStatus_Failure;
  }
  bool observationStatus =
    RadioLogicCreator::CustomizeClinicalCaseObservationInstance
    (RadioLogicCreator::observationId, observationTemplateId);
  bool answerStatus =
    RadioLogicCreator::CustomizeClinicalCaseAnswerInstance
    (RadioLogicCreator::answerId, answerTemplateId);
  // free strings
  OrthancPluginFreeString(context, observationTemplateId);
  OrthancPluginFreeString(context, answerTemplateId);
  if (observationStatus == false || answerStatus == false) {
    LOG(INFO) << "*** Customization of Observation or Answer DICOM files failed";
    RadioLogicCreator::errorMessages.append
      (" * Customization of Observation or Answer DICOM files failed");
    return OrthancPluginJobStepStatus_Failure;
  }
  RadioLogicCreator::UpdateProgress(1.0);
  Json::Value info;
  info = Json::objectValue;
  info["Plugin"] = "RadioLogicCreator";
  info["Clinical Case Author"] = RadioLogicCreator::caseAuthor;
  info["Clinical Case Name"] = RadioLogicCreator::clinicalCase.substr(11);
  info["Clinical Case Description"] = RadioLogicCreator::caseDescription;
  info["Instances processed"] = RadioLogicCreator::maxSteps_;
  info["Scramble Key"] = RadioLogicCreator::scrambleKey;
  if (RadioLogicCreator::errorMessages == "") {
    RadioLogicCreator::errorMessages = "none";
  }
  info["Issues"] = RadioLogicCreator::errorMessages;
  RadioLogicCreator::UpdateContent(info);
  /*
  RadioLogicCreator::UpdateSerialized(info);
  */
  LOG(INFO) << "*** RadioLogicCreator Job " << jobName_ << " Step() Success";
  return OrthancPluginJobStepStatus_Success;
  } else {
    if (RadioLogicCreator::counter_ == 0) {
      // initialize Job
      RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
      RadioLogicCreator::patientId = "radiologic-" +
        std::string(RadioLogicCreator::dicomUidSuffix);
      // get number of instances to modify
      std::stringstream instancesStream(RadioLogicCreator::instancesList);
      // convert stringstream to array
      int len = 0;
      while (instancesStream.good()) {
        std::string substr;
        getline(instancesStream, substr, ',');
        LOG(INFO) << "*** subString: " << substr;
        RadioLogicCreator::instancesArray_.push_back(substr);
        len++;
      }
      LOG(INFO) << "*** Number of instances to modify: " << len;
      // set maxsteps to number of instances
      RadioLogicCreator::maxSteps_ = len;
      // set Job Info
      Json::Value info;
      info = Json::objectValue;
      info["Project"] = "RadioLogic";
      info["Plugin Developer"] = "Marco BARNIG";
      RadioLogicCreator::UpdateContent(info);
      RadioLogicCreator::UpdateSerialized(info);
    }  // end if counter == 0
    LOG(INFO) << "*** Counter value: " << RadioLogicCreator::counter_;
    LOG(INFO) << "*** maxSteps value: " << RadioLogicCreator::maxSteps_;
    bool ok = RadioLogicCreator::CustomizeClinicalCaseInstances
      (instancesArray_[RadioLogicCreator::counter_]);
    if (ok == true) {
      // counter incremented after passing value to customization function
      RadioLogicCreator::counter_++;
      RadioLogicCreator::UpdateProgress
       (RadioLogicCreator::counter_ / RadioLogicCreator::maxSteps_);
      LOG(INFO) << "*** RadioLogicCreator Job " << jobName_
        << " Step() Continue";
      return OrthancPluginJobStepStatus_Continue;
    } else {
      LOG(INFO) << "*** RadioLogicCreator " << jobName_
        << " Step() Failure";
      return OrthancPluginJobStepStatus_Failure;
    }
  }  // end counter == maxSteps
}  // end Step()

void RadioLogicCreator::Stop(OrthancPluginJobStopReason reason) {
  switch (reason) {
    case OrthancPluginJobStopReason_Success :
      LOG(INFO) << "*** RadioLogicCreator Job "
        << jobName_ << " Stop() Success";
      break;
    case OrthancPluginJobStopReason_Paused :
      LOG(INFO) << "*** RadioLogicCreator Job "
        << jobName_  << " Stop() Pause";
      break;
    case OrthancPluginJobStopReason_Failure :
      LOG(INFO) << "*** RadioLogicCreator Job "
        << jobName_  << " Stop() Failure";
      break;
    case OrthancPluginJobStopReason_Canceled :
      LOG(INFO) << "*** RadioLogicCreator Job "
        << jobName_ << " Stop() Cancel";
    break;
    default :
      LOG(INFO) << "*** RadioLogicCreator Job-Error: "
        << jobName_ << " the stop-reason is out of enum range";
  }
}

void RadioLogicCreator::Reset() {
  LOG(INFO) << "*** RadioLogicCreator Job " << jobName_ << " Reset()";
  // check eventually if the RESET was due to a job failure or a job cancel
}

// ************************************************************************

bool RadioLogicCreator::CustomizeClinicalCaseInstances
    (std::string currentInstanceId) {
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  // generate SOPinstanceUID
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::sopInstanceUid =
    RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // free string
  OrthancPluginFreeString(context, RadioLogicCreator::dicomUidSuffix);
  // get StudyInstanceUid from current instance
  std::string studyUidUri = "/instances/"
    + currentInstanceId + "/content/0020-000d";
  std::string seriesUidUri = "/instances/"
    + currentInstanceId + "/content/0020-000e";
  OrthancPluginMemoryBuffer temp1;
  OrthancPluginErrorCode studyError =
    OrthancPluginRestApiGet(context, &temp1, studyUidUri.c_str());
  // get SeriesInstanceUid from current instance
  OrthancPluginMemoryBuffer temp2;
  OrthancPluginErrorCode seriesError =
    OrthancPluginRestApiGet(context, &temp2, seriesUidUri.c_str());
  if (studyError != 0 && seriesError != 0) {
    LOG(INFO) << "*** error during UID requests from instances";
    RadioLogicCreator::errorMessages.append("* UID request error for instance");
    // free memory buffers
    OrthancPluginFreeMemoryBuffer(context, &temp1);
    OrthancPluginFreeMemoryBuffer(context, &temp2);
    return false;
  }
  const char * studyUidTag = static_cast< const char * >(temp1.data);
  const char * seriesUidTag = static_cast< const char * >(temp2.data);
  std::string s1 = std::string(studyUidTag);
  std::string studyUidString = s1.substr(0, temp1.size);
  LOG(INFO) << "*** original studyUidString: " << studyUidString;
  LOG(INFO) << "*** studyUidString lenght: " << studyUidString.length();
  LOG(INFO) << "*** studyUidSubstring: "
    <<  studyUidString.substr(studyUidString.length() - 37);
  std::string s2 = std::string(seriesUidTag);
  std::string seriesUidString = s2.substr(0, temp2.size);
  LOG(INFO) << "*** original seriesUidString: " << seriesUidString;
  LOG(INFO) << "*** seriesUidString lenght: " << seriesUidString.length();
  LOG(INFO) << "*** seriesUidSubstring: "
    <<  seriesUidString.substr(seriesUidString.length() - 37);
  // free memory buffers
  OrthancPluginFreeMemoryBuffer(context, &temp1);
  OrthancPluginFreeMemoryBuffer(context, &temp2);
  RadioLogicCreator::studyInstanceUid =
    RadioLogicCreator::dicomUidPrefix +
    studyUidString.substr(studyUidString.length() - 37);
  RadioLogicCreator::seriesInstanceUid =
    RadioLogicCreator::dicomUidPrefix +
    seriesUidString.substr(studyUidString.length() - 37);
  LOG(INFO) << "*** SOPinstanceUID: "
    << RadioLogicCreator::sopInstanceUid;
  LOG(INFO) << "*** patientID: "
    << RadioLogicCreator::patientId;
  LOG(INFO) << "*** studyInstanceUid: "
    << RadioLogicCreator::studyInstanceUid;
  LOG(INFO) << "*** seriesInstanceUid: "
    << RadioLogicCreator::seriesInstanceUid;
  LOG(INFO) << "*** Anonymize stored instance: "
    << currentInstanceId;
  std::string temp = "/instances/" + currentInstanceId + "/anonymize";
  const char* myUri = temp.c_str();
  // set JSON body
  Json::Value replace;
  replace["PatientName"] = RadioLogicCreator::clinicalCase.substr(11, -1);
  replace["PatientID"] = RadioLogicCreator::patientId;
  replace["StudyInstanceUID"] = RadioLogicCreator::studyInstanceUid;
  replace["SeriesInstanceUID"] = RadioLogicCreator::seriesInstanceUid;
  replace["SOPInstanceUID"] = RadioLogicCreator::sopInstanceUid;
  replace["StudyDate"] = RadioLogicCreator::caseDate;
  replace["SeriesDate"] = RadioLogicCreator::caseDate;
  Json::Value keep;
  keep.append("InstitutionName");
  keep.append("PatientSex");
  keep.append("StudyDescription");
  keep.append("SeriesDescription");
  // keep.append("SeriesNumber");
  // keep.append("InstanceNumber");
  // keep.append("BodyPartExamined");
  Json::Value root = Json::objectValue;
  root["Replace"] = replace;
  root["Keep"] = keep;
  root["KeepPrivateTags"] = false;
  root["DicomVersion"] = "2017c";
  root["Force"] = true;
  RadioLogicCreator::dicomJsonBody = root.toStyledString();
  const char* myBody = RadioLogicCreator::dicomJsonBody.c_str();
  uint32_t myBodySize = strlen(myBody);
  // reserve memory space to hold the anonymized DICOM file
  OrthancPluginMemoryBuffer dicom;
  OrthancPluginErrorCode anonymizeError =
    OrthancPluginRestApiPost(context, &dicom, myUri, myBody, myBodySize);
  LOG(INFO) << "*** anonymizeError: " << anonymizeError;
  if (anonymizeError != 0) {
    LOG(INFO) << "*** Anonymization error for instance " <<  currentInstanceId;
    RadioLogicCreator::errorMessages.append
     ("* Anonymization error for instance " + currentInstanceId);
    OrthancPluginFreeMemoryBuffer(context, &dicom);
    return false;
  }
  // write anonymized DICOM file to /tmp folder
  std::string currentPath = "/tmp/current-" +
    currentInstanceId + ".dcm";
  OrthancPluginErrorCode writeError =
    OrthancPluginWriteFile(context, currentPath.c_str(),
    dicom.data, dicom.size);
  // free memory buffer
  OrthancPluginFreeMemoryBuffer(context, &dicom);
  if (writeError != 0) {
    LOG(INFO) << "*** current instance writeError: " << writeError;
    RadioLogicCreator::errorMessages.append
      ("* write error for current instance ");
    return false;
  }
  // Get transferSyntax from current instance
  OrthancPluginMemoryBuffer jsonResponse;
  std::string s = "/instances/" + currentInstanceId  + "/header";
  const char * getUri = s.c_str();
  OrthancPluginErrorCode getHeaderError =
    OrthancPluginRestApiGet(context, &jsonResponse, getUri);
  LOG(INFO) << "current instance getHeaderError: " << getHeaderError;
  const char * jsonData = static_cast<const char*>(jsonResponse.data);
  std::string jsonString = std::string(jsonData);
  Json::Value root2;
  Json::Reader reader;
  bool parseStatus = reader.parse(jsonString, root2);
  // free the memory buffer
  OrthancPluginFreeMemoryBuffer(context, &jsonResponse);
  if (parseStatus != true) {
    // do nothing
    LOG(INFO) << "*** The JSON header parsing failed for current instance ";
    RadioLogicCreator::errorMessages.append
      ("* JSON header parsing error for current instance ");
  } else {
    // check if instance is uncompressed
    std::string transferSyntax = root2["0002,0010"]["Value"].asString();
    if (transferSyntax == "1.2.840.10008.1.2.1") {
      bool systemCall = CompressAndScaleDicomImage(currentInstanceId);
      if (systemCall != true) {
        LOG(INFO) << "*** The compression failed for current instance ";
        RadioLogicCreator::errorMessages.append
          ("* Compression error for current instance ");
      return false;
      }  // end systemcall
    } else {  // files are already compressed
    // Read anonymized file from /tmp folder (Toolbox)
      LOG(INFO) << "*** current instance is already compressed";
      OrthancPluginMemoryBuffer temp3;
      OrthancPluginErrorCode readError2 =
        OrthancPluginReadFile(context, &temp3, currentPath.c_str());
      if (readError2 == 0) {
        // Upload the anonymized file through the REST API with
        // unchanged instanceUID ; overwrite instances in Orthanc
        // configuration must be enabled
        OrthancPluginMemoryBuffer temp4;
        OrthancPluginErrorCode storeError2 =
          OrthancPluginRestApiPost(context, &temp4,
          "/instances", temp3.data, temp3.size);
        OrthancPluginFreeMemoryBuffer(context, &temp3);
        OrthancPluginFreeMemoryBuffer(context, &temp4);
        if (storeError2 == 0) {
          LOG(INFO) << "*** Uploading file was successfull";
        } else {
          LOG(INFO) << "*** Upload store Error: " << storeError2;
         return false;
        }  // end storeError2
      } else {
        LOG(INFO) << "*** Read Error2: " << readError2;
        OrthancPluginFreeMemoryBuffer(context, &temp3);
        return false;
      }  // end readError2
    }  // end transferSyntax
  }  // end parseStattus
  LOG(INFO) << "*** Return from customization function";
  return true;
}

// ***********************************************************************

bool RadioLogicCreator::CustomizeClinicalCaseObservationInstance
    (std::string observationInstanceId, std::string observationTemplateId) {
  LOG(INFO) << "*** Customization : ObservationInstanceId: "
    << observationInstanceId;
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  char* jsonResult = OrthancPluginDicomInstanceToJson(context,
    observationInstanceId.c_str(), OrthancPluginDicomToJsonFormat_Full,
    OrthancPluginDicomToJsonFlags_None, 0);
  Json::Value content;
  Json::Reader reader;
  bool parsingSuccessful = reader.parse(jsonResult, content);
  if (parsingSuccessful != true) {
  LOG(INFO) << "*** Customization - Failed to parse JSON: "
    << reader.getFormattedErrorMessages();
  RadioLogicCreator::errorMessages.append
    ("* JSON parsing error for Observation file ");
  return false;
  }
  // ImagePixelFormat, ImageWidth, ImageHeight, ImagePitch
  std::string imageHeight = content["0028,0010"]["Value"].asString();  // rows
  LOG(INFO) << "*** ImageHeight: " << imageHeight;
  std::string imageWidth = content["0028,0011"]["Value"].asString();  // columns
  LOG(INFO) << "*** ImageWidth: " << imageWidth;
  std::string samplesPerPixel = content["0028,0002"]["Value"].asString();
  LOG(INFO) << "*** SamplesPerPixel: " << samplesPerPixel;
  std::string photometricRepresentation =
    content["0028,0004"]["Value"].asString();
  LOG(INFO) << "*** PhotometricRepresentation: "
    << photometricRepresentation << " size: "
    << photometricRepresentation.length();
  std::string bitsAllocated =
    content["0028,0100"]["Value"].asString();
  LOG(INFO) << "*** BitsAllocated: "
    << bitsAllocated;
  std::string bitsStored =
    content["0028,0101"]["Value"].asString();
  LOG(INFO) << "*** BitsBitsStored: "
    << bitsStored;
  std::string imageHighBit =
    content["0028,0102"]["Value"].asString();
  LOG(INFO) << "*** HighBit: " << imageHighBit;
  std::string pixelRepresentation =
    content["0028,0103"]["Value"].asString();
  LOG(INFO) << "*** PixelRepresentation: "
    << pixelRepresentation;
  // get the observation template file from server
  OrthancPluginMemoryBuffer target;
  OrthancPluginErrorCode getError =
    OrthancPluginGetDicomForInstance(context, &target,
    observationTemplateId.c_str());
  if (getError != 0) {
    LOG(INFO) << "*** observationTemplate getError: " << getError;
    RadioLogicCreator::errorMessages.append
    ("* HTTP error for Observation template ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &target);
    return false;
  }
  // write template DICOM file to /tmp folder
  std::string templatePath = "/tmp/observation-" +
    observationInstanceId + ".dcm";
  OrthancPluginErrorCode writeTemplateError =
    OrthancPluginWriteFile(context, templatePath.c_str(),
    target.data, target.size);
  // free memory buffer
  OrthancPluginFreeMemoryBuffer(context, &target);
  if ( writeTemplateError != 0 ) {
    LOG(INFO) << "*** observation writeTemplateError: " << writeTemplateError;
    RadioLogicCreator::errorMessages.append
      ("* write error for Obervation template ");
    return false;
  }
  // request raw pixeldata
  OrthancPluginMemoryBuffer pixels;
  std::string pixelUri = "/instances/" +
    observationInstanceId + "/frames/0/raw";
  OrthancPluginErrorCode pixelError =
    OrthancPluginRestApiGet(context, &pixels,
    pixelUri.c_str());
  if (pixelError != 0) {
    LOG(INFO) << "*** observation request pixelError: "
      << pixelError;
    RadioLogicCreator::errorMessages.append
      ("* HTTP error for Observation pixel data ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &pixels);
    return false;
  }
  // write pixel data to /tmp folder
  std::string pixelsPath = "/tmp/pixels-" +
    observationInstanceId + ".raw";
  OrthancPluginErrorCode writePixelsError =
    OrthancPluginWriteFile(context, pixelsPath.c_str(),
    pixels.data, pixels.size);
  // free memory buffer
  OrthancPluginFreeMemoryBuffer(context, &pixels);
  if (writePixelsError != 0) {
    LOG(INFO) << "*** observation writePixelsError: "
      << writePixelsError;
    RadioLogicCreator::errorMessages.append
      ("* write error for Obervation pixel data ");
    return false;
  }
  // generate a new SOPinstanceUID
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::sopInstanceUid =
    RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // create a new UID for the Observation & Answer Study
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::studyInstanceUid = RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // create a new UID for the Observation Series
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::seriesInstanceUid = RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // free string
  OrthancPluginFreeString(context, RadioLogicCreator::dicomUidSuffix);
  // prepare dcmodifyCommand
  std::string dcmodifyCommand =
    "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmodify -v -nb ";
  // pixel attributes
  dcmodifyCommand.append("-i '(0028,0010)=" + imageHeight + "' ");
  dcmodifyCommand.append("-i '(0028,0011)=" + imageWidth + "' ");
  dcmodifyCommand.append("-i '(0028,0002)=" + samplesPerPixel + "' ");
  dcmodifyCommand.append("-i '(0028,0004)=" +
    photometricRepresentation + "' ");
  // dcmodifyCommand.append("-i '(0028,0006)=" + myPlanarConfiguration +
  // "' "); generates error if this tag is not present
  dcmodifyCommand.append("-i '(0028,0100)=" + bitsAllocated + "' ");
  dcmodifyCommand.append("-i '(0028,0101)=" + bitsStored + "' ");
  dcmodifyCommand.append("-i '(0028,0102)=" + imageHighBit + "' ");
  dcmodifyCommand.append("-i '(0028,0103)=" + pixelRepresentation + "' ");
  // pixelData
  dcmodifyCommand.append("-if '(7fe0,0010)=/tmp/pixels-" +
    observationInstanceId + ".raw' ");
  // private tags (convert possibleDiagnoses string into array ;
  // https://stackoverflow.com/questions/1894886/parsing-a-comma-delimited-stdstring)
  std::stringstream stream(RadioLogicCreator::possibleDiagnoses);
  std::string word = "";
  int i = 0;
  std::string possibleDiagnosesArray[10];
  while (getline(stream, word, ',')) {
    possibleDiagnosesArray[i] = word;
    LOG(INFO) << "*** Diagnoses: " << word;
    i++;
  }
  dcmodifyCommand.append("-i '(4321,0010)=RadioLogic' ");
  dcmodifyCommand.append("-i '(4321,1010)=" + possibleDiagnosesArray[0] + "' ");
  dcmodifyCommand.append("-i '(4321,1011)=" + possibleDiagnosesArray[1] + "' ");
  dcmodifyCommand.append("-i '(4321,1012)=" + possibleDiagnosesArray[2] + "' ");
  dcmodifyCommand.append("-i '(4321,1013)=" + possibleDiagnosesArray[3] + "' ");
  dcmodifyCommand.append("-i '(4321,1014)=" + possibleDiagnosesArray[4] + "' ");
  dcmodifyCommand.append("-i '(4321,1015)=" + possibleDiagnosesArray[5] + "' ");
  dcmodifyCommand.append("-i '(4321,1016)=" + possibleDiagnosesArray[6] + "' ");
  dcmodifyCommand.append("-i '(4321,1017)=" + possibleDiagnosesArray[7] + "' ");
  dcmodifyCommand.append("-i '(4321,1018)=" + possibleDiagnosesArray[8] + "' ");
  dcmodifyCommand.append("-i '(4321,1019)=" + possibleDiagnosesArray[9] + "' ");
  dcmodifyCommand.append("-i '(4321,1021)=" +
    RadioLogicCreator::scrambleKey + "' ");
  dcmodifyCommand.append("-i '(4321,1022)=" +
    RadioLogicCreator::caseAuthor + "' ");
  // patient Name and Id
  dcmodifyCommand.append("-i '(0010,0010)=" +
    RadioLogicCreator::clinicalCase.substr(11, -1) + "' ");
  dcmodifyCommand.append("-i '(0010,0020)=" +
    RadioLogicCreator::patientId + "' ");
  // UID's
  dcmodifyCommand.append("-i '(0020,000d)=" +
    RadioLogicCreator::studyInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0020,000e)=" +
    RadioLogicCreator::seriesInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0008,0018)=" +
    RadioLogicCreator::sopInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0008,0020)=" +
    RadioLogicCreator::caseDate + "' ");
  dcmodifyCommand.append("-i '(0008,0021)=" +
    RadioLogicCreator::caseDate + "' ");
  // dicom file path
  dcmodifyCommand.append(templatePath);
  LOG(INFO) << "*** dcmodifyCommand: " << dcmodifyCommand;
  // execute the system command
  int dcmodifyStatus = system(dcmodifyCommand.c_str());
  LOG(INFO) << "*** dcmodify observation dicom file Status: " << dcmodifyStatus;
  if (dcmodifyStatus != 0) {
    LOG(INFO) << "*** dcmodify system call error for observation";
    RadioLogicCreator::errorMessages.append
      ("* dcmodify system call error for answer ");
    return false;
  }
  // read modified template DICOM file ;
  // reserve memory space to hold the Dicom content
  OrthancPluginMemoryBuffer dicom;
  // read file (Toolbox)
  OrthancPluginErrorCode readError =
    OrthancPluginReadFile(context, &dicom, templatePath.c_str());
  if (readError != 0) {
    LOG(INFO) << "*** observation readError: " << readError;
    RadioLogicCreator::errorMessages.append
      ("* read error for modified Observation template ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &dicom);
    return false;
  }
  // upload modified template DICOM file
  OrthancPluginMemoryBuffer response;
  const char* myUri = "/instances";
  OrthancPluginErrorCode storeError = OrthancPluginRestApiPost
    (context, &response, myUri, dicom.data, dicom.size);
  // free memory buffers
  OrthancPluginFreeMemoryBuffer(context, &dicom);
  OrthancPluginFreeMemoryBuffer(context, &response);
  if (storeError != 0) {
    LOG(INFO) << "*** observation storeError: " << storeError;
    RadioLogicCreator::errorMessages.append
      ("* upload error for modified Observation template");
    return false;
  }
  // remove temporary files in /tmp folder
  remove(pixelsPath.c_str());
  remove(templatePath.c_str());
  // remove original Observation instance on server
  std::string deleteUri = "/instances/" + observationInstanceId;
  OrthancPluginErrorCode deleteError =
    OrthancPluginRestApiDelete(context, deleteUri.c_str());
  if (deleteError != 0) {
    LOG(INFO) << "*** observation deleteError: " << deleteError;
    RadioLogicCreator::errorMessages.append
      ("* delete error for original Observation DICOM file");
    return false;
  }
  return true;
}

// ********************************************************************

bool RadioLogicCreator::CustomizeClinicalCaseAnswerInstance
    (std::string answerInstanceId, std::string answerTemplateId) {
  LOG(INFO) << "*** Customization : AnswerInstanceId: "
    << answerInstanceId;
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  char* jsonResult = OrthancPluginDicomInstanceToJson
    (context, answerInstanceId.c_str(), OrthancPluginDicomToJsonFormat_Full,
    OrthancPluginDicomToJsonFlags_None, 0);
  Json::Value content;
  Json::Reader reader;
  bool parsingSuccessful = reader.parse(jsonResult, content);
  if (parsingSuccessful != true) {
    LOG(INFO) << "*** Failed to parse JSON: "
      << reader.getFormattedErrorMessages();
    RadioLogicCreator::errorMessages.append
      ("* JSON parsing error for Answer file ");
    return false;
  }
  // ImagePixelFormat, ImageWidth, ImageHeight, ImagePitch
  std::string imageHeight = content["0028,0010"]["Value"].asString();  // rows
  LOG(INFO) << "*** ImageHeight: " << imageHeight;
  std::string imageWidth = content["0028,0011"]["Value"].asString();  // columns
  LOG(INFO) << "*** ImageWidth: " << imageWidth;
  std::string samplesPerPixel = content["0028,0002"]["Value"].asString();
  LOG(INFO) << "*** SamplesPerPixel: " << samplesPerPixel;
  std::string photometricRepresentation =
    content["0028,0004"]["Value"].asString();
  LOG(INFO) << "*** PhotometricRepresentation: "
    << photometricRepresentation << " size: "
    << photometricRepresentation.length();
  std::string bitsAllocated =
    content["0028,0100"]["Value"].asString();
  LOG(INFO) << "*** BitsAllocated: " << bitsAllocated;
  std::string bitsStored =
    content["0028,0101"]["Value"].asString();
  LOG(INFO) << "*** BitsBitsStored: " << bitsStored;
  std::string imageHighBit =
    content["0028,0102"]["Value"].asString();
  LOG(INFO) << "*** HighBit: " << imageHighBit;
  std::string pixelRepresentation =
    content["0028,0103"]["Value"].asString();
  LOG(INFO) << "*** PixelRepresentation: "
    << pixelRepresentation;
  // get the answer template file from server
  OrthancPluginMemoryBuffer target;
  OrthancPluginErrorCode getError = OrthancPluginGetDicomForInstance
    (context, &target, answerTemplateId.c_str());
  if (getError != 0) {
    LOG(INFO) << "*** answerTemplate getError: " << getError;
    RadioLogicCreator::errorMessages.append
      ("* HTTP error for Answer template ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &target);
    return false;
  }
  // write template answer DICOM file to /tmp folder
  std::string templatePath = "/tmp/answer-" + answerInstanceId + ".dcm";
  OrthancPluginErrorCode writeTemplateError = OrthancPluginWriteFile
    (context, templatePath.c_str(), target.data, target.size);
  // free memory buffer
  OrthancPluginFreeMemoryBuffer(context, &target);
  if ( writeTemplateError != 0 ) {
    LOG(INFO) << "*** answer writeTemplateError: " << writeTemplateError;
    RadioLogicCreator::errorMessages.append
      ("* write error for Answer template ");
    return false;
  }
  // request raw pixeldata
  OrthancPluginMemoryBuffer pixels;
  std::string pixelUri = "/instances/" + answerInstanceId + "/frames/0/raw";
  OrthancPluginErrorCode pixelError = OrthancPluginRestApiGet
    (context, &pixels, pixelUri.c_str());
  if (pixelError != 0) {
    LOG(INFO) << "*** answer request pixelError: " << pixelError;
    RadioLogicCreator::errorMessages.append
      ("* HTTP error for Answer pixel data ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &pixels);
    return false;
  }
  std::string pixelsPath = "/tmp/pixels-" + answerInstanceId + ".raw";
  OrthancPluginErrorCode writePixelsError = OrthancPluginWriteFile
    (context, pixelsPath.c_str(), pixels.data, pixels.size);
  // free memory buffer
  OrthancPluginFreeMemoryBuffer(context, &pixels);
  if (writePixelsError != 0) {
    LOG(INFO) << "*** answer writePixelsError: " << writePixelsError;
    RadioLogicCreator::errorMessages.append
      ("* write error for Answer pixel data ");
    return false;
  }
  // generate a new SOPinstanceUID
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::sopInstanceUid = RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // create a new UID for the Observation Series and use the studyInstanceUid
  // created in the CustomizeClinicalCaseObservationInstance function
  RadioLogicCreator::dicomUidSuffix = OrthancPluginGenerateUuid(context);
  RadioLogicCreator::seriesInstanceUid = RadioLogicCreator::dicomUidPrefix +
    std::string(RadioLogicCreator::dicomUidSuffix);
  // free string
  OrthancPluginFreeString(context, RadioLogicCreator::dicomUidSuffix);
  // prepare dcmodifyCommand
  std::string dcmodifyCommand =
    "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmodify -v -nb ";
  // pixel attributes
  dcmodifyCommand.append("-i '(0028,0010)=" + imageHeight + "' ");
  dcmodifyCommand.append("-i '(0028,0011)=" + imageWidth + "' ");
  dcmodifyCommand.append("-i '(0028,0002)=" + samplesPerPixel + "' ");
  dcmodifyCommand.append("-i '(0028,0004)=" +
    photometricRepresentation + "' ");
  // dcmodifyCommand.append("-i '(0028,0006)=" + myPlanarConfiguration + "' ");
  dcmodifyCommand.append("-i '(0028,0100)=" + bitsAllocated + "' ");
  dcmodifyCommand.append("-i '(0028,0101)=" + bitsStored + "' ");
  dcmodifyCommand.append("-i '(0028,0102)=" + imageHighBit + "' ");
  dcmodifyCommand.append("-i '(0028,0103)=" + pixelRepresentation + "' ");
  // pixelData
  dcmodifyCommand.append("-if '(7fe0,0010)=/tmp/pixels-" +
    answerInstanceId + ".raw' ");
  // private tags
  dcmodifyCommand.append("-i '(4321,0010)=RadioLogic' ");
  dcmodifyCommand.append("-i '(4321,1020)=" +
    RadioLogicCreator::correctDiagnosis + "' ");
  dcmodifyCommand.append("-i '(4321,1022)=" +
    RadioLogicCreator::caseAuthor + "' ");
  // patient Name and Id
  dcmodifyCommand.append("-i '(0010,0010)=" +
    RadioLogicCreator::clinicalCase.substr(11, -1) + "' ");
  dcmodifyCommand.append("-i '(0010,0020)=" +
    RadioLogicCreator::patientId + "' ");
  // UID's
  dcmodifyCommand.append("-i '(0020,000d)=" +
    RadioLogicCreator::studyInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0020,000e)=" +
    RadioLogicCreator::seriesInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0008,0018)=" +
    RadioLogicCreator::sopInstanceUid + "' ");
  dcmodifyCommand.append("-i '(0008,0020)=" +
    RadioLogicCreator::caseDate + "' ");
  dcmodifyCommand.append("-i '(0008,0021)=" +
    RadioLogicCreator::caseDate + "' ");
  // dicom file path
  dcmodifyCommand.append(templatePath);
  LOG(INFO) << "*** dcmodifyCommand: " << dcmodifyCommand;
  // execute the system command
  int dcmodifyStatus = system(dcmodifyCommand.c_str());
  LOG(INFO) << "*** dcmodify answer dicom file Status: " << dcmodifyStatus;
  if (dcmodifyStatus != 0) {
    LOG(INFO) << "*** dcmodify system call error for answer";
    RadioLogicCreator::errorMessages.append
      ("* dcmodify system call error for answer ");
  }
  // read modified template DICOM file (Toolbox) ;
  // reserve memory space to hold the Dicom content
  OrthancPluginMemoryBuffer dicom;
  OrthancPluginErrorCode readError =
    OrthancPluginReadFile(context, &dicom, templatePath.c_str());
  if (readError != 0) {
    LOG(INFO) << "*** answer readError: " << readError;
    RadioLogicCreator::errorMessages.append
      ("* read error for modified Answer template ");
    // free memory buffer
    OrthancPluginFreeMemoryBuffer(context, &dicom);
    return false;
  }
  // upoad modified template DICOM file
  OrthancPluginMemoryBuffer response;
  const char* myUri = "/instances";
  OrthancPluginErrorCode storeError = OrthancPluginRestApiPost
    (context, &response, myUri, dicom.data, dicom.size);
  // free memory buffers
  OrthancPluginFreeMemoryBuffer(context, &dicom);
  OrthancPluginFreeMemoryBuffer(context, &response);
  if (storeError != 0) {
    LOG(INFO) << "*** answer storeError: " << storeError;
    RadioLogicCreator::errorMessages.append
      ("* upload error for modified Answer template");
    return false;
  }
  // remove temporary files in /tmp folder
  remove(pixelsPath.c_str());
  remove(templatePath.c_str());
  // remove original Answer instance on server
  std::string deleteUri = "/instances/" + answerInstanceId;
  OrthancPluginErrorCode deleteError =
    OrthancPluginRestApiDelete(context, deleteUri.c_str());
  if (deleteError != 0) {
    LOG(INFO) << "*** answer deleteError: " << deleteError;
    RadioLogicCreator::errorMessages.append
      ("* delete error for original Answer DICOM file");
    return false;
  }
  return true;
}

// **********************************************************

void RadioLogicCreator::setParameters(std::string answer, std::string author,
    std::string casedate, std::string description, std::string clinicalcase,
    std::string diagnosis, std::string instances, std::string observation,
    std::string diagnoses, std::string key) {
  RadioLogicCreator::answerId = answer;
  RadioLogicCreator::caseAuthor = author;
  RadioLogicCreator::caseDate = casedate;
  RadioLogicCreator::caseDescription = description;
  RadioLogicCreator::clinicalCase = clinicalcase;
  RadioLogicCreator::correctDiagnosis = diagnosis;
  RadioLogicCreator::instancesList = instances;
  RadioLogicCreator::observationId = observation;
  RadioLogicCreator::possibleDiagnoses = diagnoses;
  RadioLogicCreator::scrambleKey = key;
  LOG(INFO) << "*** Function setParameters";
  LOG(INFO) << "*** AnswerId: " << RadioLogicCreator::answerId;
  LOG(INFO) << "*** CaseAuthor: " << RadioLogicCreator::caseAuthor;
  LOG(INFO) << "*** CaseDate: " << RadioLogicCreator::caseDate;
  LOG(INFO) << "*** ClinicalCase: " << RadioLogicCreator::clinicalCase;
  LOG(INFO) << "*** CorrectDiagnosis: " << RadioLogicCreator::correctDiagnosis;
  LOG(INFO) << "*** Description: " << RadioLogicCreator::caseDescription;
  LOG(INFO) << "*** InstanceList: " << RadioLogicCreator::instancesList;
  LOG(INFO) << "*** ObservationId: " << RadioLogicCreator::observationId;
  LOG(INFO) << "*** PossibleDiagnoses: "
    << RadioLogicCreator::possibleDiagnoses;
  LOG(INFO) << "*** ScrambleKey: " << RadioLogicCreator::scrambleKey;
}
