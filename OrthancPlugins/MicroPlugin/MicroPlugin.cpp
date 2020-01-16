#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/SystemToolbox.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <string>

OrthancPluginErrorCode ScaleDicomImage(OrthancPluginDicomInstance *instance, const char *instanceId) {
  LOG(INFO) << "*** A new DICOM file with ID " << instanceId << "has been received";
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  // do not scale twice the same DICOM file
  if (OrthancPluginGetInstanceOrigin(context, instance) == OrthancPluginInstanceOrigin_Plugin)
  {
    return OrthancPluginErrorCode_Success;
  }
  // store DICOM file in temporary folder
  OrthancPluginErrorCode writeError = OrthancPluginWriteFile(context, "/tmp/original.dcm",
    OrthancPluginGetInstanceData(context, instance),
    OrthancPluginGetInstanceSize(context, instance));
  if (writeError) {
    return writeError;
  }
  // make system call to dcmconv to decompress the DICOM image
  std::string gdcmconvCommand = "/GDCM-3.0.3-Linux-x86_64/bin/gdcmconv --raw /tmp/original.dcm /tmp/raw.dcm";
  int gdcmconvStatus = system(gdcmconvCommand.c_str());
  LOG(INFO) << "*** System command gdcmconv status: " << gdcmconvStatus;
  // make system call to dcmscale of the Offis DCM Toolkit
  std::string dcmscaleCommand = "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmscale +Sxf 0.5 /tmp/raw.dcm /tmp/scaled.dcm";
  int dcmscaleStatus = system(dcmscaleCommand.c_str());
  LOG(INFO) << "*** System command dcmscale status: " << dcmscaleStatus;
  // read DICOM file from temporary folder
  OrthancPluginMemoryBuffer temp1;
  OrthancPluginErrorCode readError = OrthancPluginReadFile(context, &temp1, "/tmp/scaled.dcm");
  if (readError) {
    return readError;
  }
  // upload scaled DICOM file to storage
  OrthancPluginMemoryBuffer temp2;
  OrthancPluginErrorCode storeError = OrthancPluginRestApiPost(context, &temp2,
    "/instances", temp1.data, temp1.size);
  if (storeError) {
    return storeError;
  }
  // free resources
  OrthancPluginFreeMemoryBuffer(context, &temp1);
  OrthancPluginFreeMemoryBuffer(context, &temp2);
  remove("/tmp/original.dcm");
  remove("/tmp/raw.dcm");
  remove("/tmp/scaled.dcm");
  return OrthancPluginErrorCode_Success;
}

extern "C"
{
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize(OrthancPluginContext* context)
  {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    OrthancPluginSetDescription(context, "Orthanc Plugin Test with Framework; upload a DICOM file with curl");
    OrthancPluginRegisterOnStoredInstanceCallback(context, ScaleDicomImage);
    return 0;
  }
  ORTHANC_PLUGINS_API void OrthancPluginFinalize()
  {
    LOG(INFO) << "MicroPlugin is finalizing";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetName()
  {
    return "MicroPlugin";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion()
  {
    return "1.0.0";
  }
}
