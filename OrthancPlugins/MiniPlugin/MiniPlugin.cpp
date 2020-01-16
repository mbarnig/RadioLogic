/**
 * Orthanc - A Lightweight, RESTful DICOM Store
 * Copyright (C) 2012-2020 Sebastien Jodogne, Belgium
 * Plugin Tutorial (C) 2020 Marco Barnig, Luxembourg
 **/

#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <json/json.h>
#include <Core/SystemToolbox.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <EmbeddedResources.h>
#include <string>
#include "ScaleImage.h"

void CallbackScaleSeries(OrthancPluginRestOutput* output,
  const char* url, const OrthancPluginHttpRequest* request) {
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  LOG(INFO) << "CallbackScaleSeries request received";
  // extract the GET arguments of the request
  if (request->method == OrthancPluginHttpMethod_Get) {
    const char * mySeriesId = request->groups[0];
    LOG(INFO) << " *** mySeriesID " << mySeriesId;
    // get list of instances related to series
    OrthancPluginMemoryBuffer temp;
    std::string seriesUri = "/series/" + std::string(mySeriesId);
    OrthancPluginErrorCode seriesError = OrthancPluginRestApiGetAfterPlugins
      (context, &temp, seriesUri.c_str());
    LOG(INFO) << "*** seriesError: " << seriesError;
    if (seriesError == 0) {
      // create new SeriesUid
      char* newSeriesUid = OrthancPluginGenerateUuid(context);
      std::string newSeriesUidString = std::string(newSeriesUid);
      // show content of buffer
      const char * seriesJson = static_cast< const char * >(temp.data);
      LOG(INFO) << "JSON Data: " << seriesJson;
      std::string jsonString = std::string(seriesJson);
      Json::Reader reader;
      Json::Value root;
      bool parseStatus = reader.parse(jsonString, root);
      if (parseStatus == true) {
        const Json::Value& instances = root["Instances"];
        for (unsigned int i = 0; i < instances.size(); i++) {
          std::string instanceId = instances[i].asString();
          ScaleImage(instanceId, newSeriesUid);
        }
      }
      // free the newSeries Uid
      OrthancPluginFreeString(context, newSeriesUid);
    }
  }
  OrthancPluginAnswerBuffer
    (context, output, "OK", 2, "text/plain");
}

extern "C" {
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize
    (OrthancPluginContext* context) {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    OrthancPluginSetDescription(context,
      "Orthanc Plugin Test with Framework; downscale a DICOM series");
    OrthancPlugins::RegisterRestCallback<CallbackScaleSeries>
     ("/series/([^/]+)/scale", true);
    // Extend the default Orthanc Explorer with custom JavaScript
    std::string explorer;
    Orthanc::EmbeddedResources::GetFileResource(explorer,
      Orthanc::EmbeddedResources::ORTHANC_EXPLORER);
    OrthancPluginExtendOrthancExplorer(context, explorer.c_str());
    return 0;
  }
  ORTHANC_PLUGINS_API void OrthancPluginFinalize() {
    LOG(INFO) << "MiniPlugin is finalizing";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetName() {
    return "MiniPlugin";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion() {
    return "1.0.0";
  }
}
