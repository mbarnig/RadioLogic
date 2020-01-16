#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <stdlib.h> /* srand, rand */
#include <time.h> /* time */
#include <string>
#include <thread>
#include "MyJob.h"

// constructor
MyJob::MyJob(std::string jobType)
:
OrthancPlugins::OrthancJob(jobType),
jobName_(jobType),
counter_(0.0),
maxSteps_(10.0) {
  LOG(INFO) << "*** MyJob " << jobName_ << " constructor";
}

// destructor
MyJob::~MyJob() {
  LOG(INFO) << "*** MyJob destructor";
}

OrthancPluginJobStepStatus MyJob::Step() {
  if (MyJob::counter_ == 10) {
     MyJob::counter_ = 0;
     MyJob::UpdateProgress(1.0);
     Json::Value detailInfo;
     detailInfo = Json::objectValue;
     detailInfo["Project"] = "RadioLogic Tutorial MultipleStepsJob";
     detailInfo["Author"] = "Marco Barnig";
     MyJob::UpdateContent(detailInfo);
     LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Step() Success";
     return OrthancPluginJobStepStatus_Success;
  } else {
  if (MyJob::counter_ == 0) {
    MyJob::UpdateProgress(0.0);
    // initialize random seed
    srand(time(0));
    }
    bool ok = MyJob::RandomGenerator();
    if (ok == true) {
      MyJob::counter_++;
      MyJob::UpdateProgress(MyJob::counter_ / MyJob::maxSteps_);
      LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Step() Continue";
      return OrthancPluginJobStepStatus_Continue;
    } else {
      LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Step() Failure";
      return OrthancPluginJobStepStatus_Failure;
    }
  }
}

void MyJob::Stop(OrthancPluginJobStopReason reason) {
  switch (reason) {
    case OrthancPluginJobStopReason_Success :
    LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Stop() Success";
    break;
    case OrthancPluginJobStopReason_Paused :
    LOG(INFO) << "*** MyJob " << MyJob::jobName_  << " Stop() Pause";
    break;
    case OrthancPluginJobStopReason_Failure :
    LOG(INFO) << "*** MyJob " << MyJob::jobName_  << " Stop() Failure";
    break;
    case OrthancPluginJobStopReason_Canceled :
    LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Stop() Cancel";
    break;
    default :
    LOG(INFO) << "*** Job-Error: " << MyJob::jobName_ << " the stop-reason is out of enum range";
  }
}

void MyJob::Reset() {
  LOG(INFO) << "*** MyJob " << MyJob::jobName_ << " Reset()";
}

bool MyJob::RandomGenerator() {
  std::this_thread::sleep_for(std::chrono::seconds(10));
  // generate random number between 1 and 100
  int randomNumber = rand() % 100;
  LOG(INFO) << "*** Random Number: " << randomNumber;
  if (randomNumber > 94) {
    return false;
  } else {
    return true;
  }
}
