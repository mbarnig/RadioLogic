/**
 * Orthanc - A Lightweight, RESTful DICOM Store
 * Copyright (C) 2012-2020 Sebastien Jodogne, Belgium
 * Plugin Tutorial (C) 2020 Marco Barnig, Luxembourg
 **/

#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <string>
#include "ScaleImage.h"

void ScaleImage(std::string instanceId, std::string seriesUid) {
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  OrthancPluginMemoryBuffer temp1;
  OrthancPluginMemoryBuffer temp2;
  OrthancPluginMemoryBuffer temp3;
  std::string writePath = "/tmp/original-" + instanceId + ".dcm";
  std::string rawPath = "/tmp/raw-" + instanceId + ".dcm";
  std::string readPath = "/tmp/scaled-" + instanceId + ".dcm";
  // get DICOM file with instanceId
  OrthancPluginErrorCode getError = OrthancPluginGetDicomForInstance(context,
    &temp1, instanceId.c_str());
    if (getError == 0) {
      // store DICOM file in temporary folder
      OrthancPluginErrorCode writeError = OrthancPluginWriteFile
       (context, writePath.c_str(), temp1.data, temp1.size);
      if (writeError == 0) {
      // make system call to gdcmconv to decompress the DICOM image
      std::string gdcmconvCommand
        = "/GDCM-3.0.3-Linux-x86_64/bin/gdcmconv --raw "
        + writePath + " " + rawPath;
      int gdcmconvStatus = system(gdcmconvCommand.c_str());
      LOG(INFO) << "*** System command gdcmconv status: " << gdcmconvStatus;
      // make system call to dcmscale of the Offis DCM Toolkit
      std::string dcmscaleCommand
        = "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmscale +Sxf 0.5 /tmp/raw-"
        + instanceId + ".dcm /tmp/scaled-" + instanceId + ".dcm";
      int dcmscaleStatus = system(dcmscaleCommand.c_str());
      LOG(INFO) << "*** System command dcmscale status: " << dcmscaleStatus;
      // modify DICOM tags with new SeriesUID and SeriesDescription
      std::string dcmodifyCommand
        = "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmodify -m \"(0020,000e)="
        + seriesUid + "\" -m \"(0008,103e)=Series with scaled images\" -gin -nb /tmp/scaled-"
        + instanceId + ".dcm";
      int dcmodifyStatus = system(dcmodifyCommand.c_str());
      LOG(INFO) << "*** System command dcmodify status: " << dcmodifyStatus;
      // read DICOM file from temporary folder
      OrthancPluginErrorCode readError
        = OrthancPluginReadFile(context, &temp2, readPath.c_str());
      if (readError == 0) {
        // upload scaled DICOM file to storage
        OrthancPluginErrorCode storeError = OrthancPluginRestApiPost
          (context, &temp3, "/instances", temp2.data, temp2.size);
        if (storeError == 0) {
          LOG(INFO) << "*** Instance " << instanceId
            << " was successfully scaled.";
        } else {
          LOG(INFO) << "*** Store instance " << instanceId << " failed!";
        }
      } else {
        LOG(INFO) << "*** Read instance " << instanceId << " failed!";
      }
    } else {
      LOG(INFO) << "*** Write instance " << instanceId << " failed!";
    }
  } else {
    LOG(INFO) << "*** Get instance " << instanceId << " failed!";
  }
  // free resources
  OrthancPluginFreeMemoryBuffer(context, &temp1);
  OrthancPluginFreeMemoryBuffer(context, &temp2);
  OrthancPluginFreeMemoryBuffer(context, &temp3);
  int removeError1 = remove(writePath.c_str());
  int removeError2 = remove(rawPath.c_str());
  int removeError3 = remove(readPath.c_str());
  if (removeError1 == 0 && removeError2 == 0 && removeError3 == 0) {
    LOG(INFO) << "*** Temporary files removed!";
  }
}
