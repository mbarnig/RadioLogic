#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <string>
#include "MyJob.h"

// constructor
MyJob::MyJob(std::string jobType)
:
OrthancPlugins::OrthancJob(jobType),
jobName_(jobType) {
  LOG(INFO) << "*** MyJob " << jobName_ << " constructor";
}

// destructor
MyJob::~MyJob() {
  LOG(INFO) << "*** MyJob destructor";
}

OrthancPluginJobStepStatus MyJob::Step() {
  LOG(INFO) << "*** MyJob " << jobName_ << "Step";
  Json::Value detailInfo;
  detailInfo = Json::objectValue;
  detailInfo["Project"] = "RadioLogic Tutorial";
  detailInfo["Author"] = "Marco Barnig";
  MyJob::UpdateContent(detailInfo);
  return OrthancPluginJobStepStatus_Success;
}

void MyJob::Stop(OrthancPluginJobStopReason reason) {
  LOG(INFO) << "*** MyJob " << jobName_ << " Stop()";
}

void MyJob::Reset() {
  LOG(INFO) << "*** MyJob " << jobName_ << " Reset()";
}