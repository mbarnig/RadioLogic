#pragma once
#include <string>
#include <stdlib.h>
#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>

class MyJob : public OrthancPlugins::OrthancJob {
  std::string jobName_;

  public:

  explicit MyJob(std::string jobType);

  ~MyJob();

  OrthancPluginJobStepStatus Step();
  void Stop(OrthancPluginJobStopReason reason);
  void Reset();
};