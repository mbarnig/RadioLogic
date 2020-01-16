#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/SystemToolbox.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <string>
#include "MyJob.h"

void CallbackMultipleStepsJob(OrthancPluginRestOutput* output, const char* url,
  const OrthancPluginHttpRequest* request) {
  LOG(INFO) << "*** CallbackMultipleStepsJob Function called";
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  // create a new job
  MyJob* multipleStepsJob = new MyJob("MultipleStepsJob");
  LOG(INFO) << "*** New multipleStepsJob created";
  // submit the job
  int priority = 2;
  std::string jobId = OrthancPlugins::OrthancJob::Submit(multipleStepsJob, priority);
  // no need to free the jobId string, ownership is taken by OrthancJob
  LOG(INFO) << "*** New multipleStepsJob submitted";
  std::string HtmlCode = "<html>\n<head>\n<title>Test</title>\n</head>\n<body>\n<h2>MultipleStepsJob with jobId " + jobId + " running in Orthanc Server</h2>\n</body>\n</html>\n";
  OrthancPluginAnswerBuffer(context, output, HtmlCode.c_str(), HtmlCode.length(), "text/html");
}

extern "C" {
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize(OrthancPluginContext* context) {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    OrthancPluginSetDescription(context, "Orthanc Plugin Test with Job Engine; do HTTP GET call to <RadioLogicArchive IP>/start-multiple-step-job");
    OrthancPlugins::RegisterRestCallback<CallbackMultipleStepsJob>("/start-multiple-steps-job", true);
    return 0;
  }
  ORTHANC_PLUGINS_API void OrthancPluginFinalize() {
    LOG(INFO) << "MultiStepsJobPlugin is finalizing";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetName() {
    return "MultiStepsJobPlugin";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion() {
    return "1.0.0";
  }
}