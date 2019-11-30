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

#include <string>
#include <stdlib.h>
#include <EmbeddedResources.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <orthanc/OrthancCPlugin.h>
#include "RadioLogicTools.h"
#include "RadioLogicCreator.h"

/*
OrthancPluginJob* Unserializer(const char* jobType, const char* serialized) {
  LOG(INFO) << "*** Unserializer started";
  if (jobType == NULL || serialized == NULL) {
    LOG(INFO) << "*** Unserializer jobType or serialized is NULL";
    return NULL;
  }
  std::string type(jobType);
  LOG(INFO) << "*** Type of jobType: " << type;
  // check if jobType name has "RadioLogic " prefix
  LOG(INFO) << "*** Clinical Case Name: " <<  type;
  // substring (position, length) : position starts with 0,
  // length is number of characters; without length up to end
  std::string clinicalCasePrefix = type.substr(0, 11);
  LOG(INFO) << "*** Clinical Case Prefix: " <<  clinicalCasePrefix;
  if (clinicalCasePrefix != "RadioLogic ") {
    return NULL;
  }
  try {
    std::string serializedJob(serialized);
    Json::Value source;
    Json::Reader reader;
    if (reader.parse(serializedJob, source)) {
      // recreate a job
      std::unique_ptr<OrthancPlugins::OrthancJob> job;
      LOG(INFO) << "*** Job " << type
        << " recreated at the start of the Orthanc server";
      job.reset(new RadioLogicCreator("RecreatedJob : " + type));
      return OrthancPlugins::OrthancJob::Create(job.release());
    } else {
        throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat,
          "Job recreation failed");
    }
  }
  catch(Orthanc::OrthancException& e) {
    LOG(ERROR)
      << "Exception while unserializing a job from the Orthanc Job Test plugin: "
      << e.What();
    return NULL;
  }
  catch(...) {
    LOG(ERROR)
      << "Error while unserializing a job from the Orthanc Job Test plugin";
    return NULL;
  }
}
*/

void CallbackStartJob(OrthancPluginRestOutput* output, const char* url,
  const OrthancPluginHttpRequest* request) {
  LOG(INFO) << "*** CallbackStartJob Function called";
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  // check HTTP request method
  if (request->method != OrthancPluginHttpMethod_Post) {
    throw Orthanc::OrthancException(Orthanc::ErrorCode_BadRequest);
    }
  // get JSON body
  Json::Value body;
  ParseJsonBody(body, request);
  LOG(INFO) << "*** Callback JSON body: " << body;
  // check if key "ClinicalCase" is included in JSON body and get
  // the name of the ClinicalCase
  std::string clinicalCaseName;
  if (!LookupStringValue(clinicalCaseName, body, "ClinicalCaseName")) {
    throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat,
      "The JSON body contains no ClinicalCaseName key");
  }
  // check if ClinicalCase name has "RadioLogic " prefix
  LOG(INFO) << "*** Clinical Case Name: " <<  clinicalCaseName;
  std::string clinicalCasePrefix = clinicalCaseName.substr(0, 11);
  LOG(INFO) << "*** Clinical Case Prefix: " <<  clinicalCasePrefix;
  std::string jobName = clinicalCaseName.substr(11);
  if (clinicalCasePrefix != "RadioLogic ") {
    throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat,
      "The ClinicalCase name has no RadioLogic prefix");
  }
  // create a new job
  RadioLogicCreator* newJob = new RadioLogicCreator(clinicalCaseName);
  LOG(INFO) << "*** New job " << clinicalCaseName << " created";
  newJob->setParameters(
    body["AnswerId"].asString(),
    body["ClinicalCaseAuthor"].asString(),
    body["ClinicalCaseDate"].asString(),
    body["ClinicalCaseDescription"].asString(),
    body["ClinicalCaseName"].asString(),
    body["CorrectDiagnosis"].asString(),
    body["DicomInstancesList"].asString(),
    body["ObservationId"].asString(),
    body["PossibleDiagnoses"].asString(),
    body["ScrambleKey"].asString());
  // submit the job
  int priority = 2;
  std::string jobId = OrthancPlugins::OrthancJob::Submit(newJob, priority);
  // no need to free the jobId string, ownership is taken by OrthancJob
  LOG(INFO) << "*** New job " << clinicalCaseName << " submitted";
  Json::Value result = Json::objectValue;
  result["JOB_ID"] = jobId;
  std::string s = result.toStyledString();
  OrthancPluginAnswerBuffer(context, output, s.c_str(), s.size(),
    "application/json");
}

extern "C" {
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize
    (OrthancPluginContext* context) {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    /* Check the version of the Orthanc core */
    int versionOk = OrthancPluginCheckVersionAdvanced(context, 1, 5, 7);
    if (versionOk == 0) {
      LOG(INFO) << "The RadioLogicCreator plugin is not compatible with the running Orthanc version";
      return -1;
    }
    OrthancPluginSetDescription(context,
      "Medical Imaging Tool to create clinical radiology cases for teaching");
    OrthancPlugins::RegisterRestCallback<CallbackStartJob>("/ralo/startjob", true);
    /*
    OrthancPluginRegisterJobsUnserializer(context, Unserializer);
    */
    // Extend the default Orthanc Explorer with custom JavaScript
    std::string explorer;
    Orthanc::EmbeddedResources::GetFileResource(explorer,
      Orthanc::EmbeddedResources::ORTHANC_EXPLORER);
    OrthancPluginExtendOrthancExplorer(context, explorer.c_str());
    return 0;
  }

  ORTHANC_PLUGINS_API void OrthancPluginFinalize() {
    LOG(WARNING) << "RadioLogicCreator plugin is finalizing";
  }

  ORTHANC_PLUGINS_API const char* OrthancPluginGetName() {
    return "RadioLogicCreator";
  }

  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion() {
    // return RADIO_LOGIC_CREATOR_VERSION;
    return "1.1.1";
  }
}
