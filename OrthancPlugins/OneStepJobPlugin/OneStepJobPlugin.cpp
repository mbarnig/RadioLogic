#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/SystemToolbox.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <string>
#include "MyJob.h"

void CallbackOneStepJob(OrthancPluginRestOutput* output, const char* url,
  const OrthancPluginHttpRequest* request) {
  LOG(INFO) << "*** CallbackOneStepJob Function called";
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  // create a new job
  MyJob* OneStepJob = new MyJob("OneStepJob");
  LOG(INFO) << "*** New OneStepJob created";
  // submit the job
  int priority = 3;
  std::string jobId = OrthancPlugins::OrthancJob::Submit(OneStepJob, priority);
  // no need to free the jobId string, ownership is taken by OrthancJob
  LOG(INFO) << "*** New OneStepJob submitted";
  std::string HtmlCode = "<html>\n<head>\n<title>Test</title>\n</head>\n<body>\n<h2>OneStepJob with jobId " + jobId + " running in Orthanc Server</h2>\n</body>\n</html>\n";
  OrthancPluginAnswerBuffer(context, output, HtmlCode.c_str(), HtmlCode.length(), "text/html");
}

extern "C" {
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize(OrthancPluginContext* context) {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    OrthancPluginSetDescription(context, "Orthanc Plugin Test with Job Engine; do HTTP GET call to <RadioLogicArchive IP>/start-one-step-job");
    OrthancPlugins::RegisterRestCallback<CallbackOneStepJob>("/start-one-step-job", true);
    return 0;
  }
  ORTHANC_PLUGINS_API void OrthancPluginFinalize() {
    LOG(INFO) << "*** OneStepJobPlugin is finalizing";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetName() {
    return "OneStepJobPlugin";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion() {
    return "1.0.0";
  }
}