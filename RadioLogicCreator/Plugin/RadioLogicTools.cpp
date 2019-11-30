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
#include <json/json.h>
#include <sstream>
#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include "RadioLogicTools.h"

void ParseJsonBody(Json::Value& target,
  const OrthancPluginHttpRequest* request) {
  Json::Reader reader;
  if (!reader.parse(reinterpret_cast<const char*>(request->body),
    reinterpret_cast<const char*>(request->body) + request->bodySize, target)) {
    throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat,
      "A JSON file was expected");
  }
}

bool LookupStringValue(std::string& target, const Json::Value& json,
  const std::string& key) {
  if (json.type() != Json::objectValue) {
    throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat);
  } else if (!json.isMember(key)) {
      return false;
    } else if (json[key].type() != Json::stringValue) {
        throw Orthanc::OrthancException(Orthanc::ErrorCode_BadFileFormat,
          "The field \"" + key + "\" in a JSON object should be a string");
      } else {
        target = json[key].asString();
        return true;
      }
}

bool CompressAndScaleDicomImage(std::string instanceId) {
  LOG(INFO) << "*** compress and scale dicom images";
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  bool ok = true;
  // Bloc 1 : scale instance if width or height 
  // of image exceeds 1023 pixels
  LOG(INFO) << "*** Compression InstanceId: " << instanceId;
  char* jsonResult = OrthancPluginDicomInstanceToJson(context,
    instanceId.c_str(), OrthancPluginDicomToJsonFormat_Full,
    OrthancPluginDicomToJsonFlags_None, 0);
  Json::Value content;
  Json::Reader reader;
  bool parsingSuccessful = reader.parse(jsonResult, content);
  OrthancPluginFreeString(context, jsonResult);
  if (parsingSuccessful == true) {
    // ImagePixelFormat, ImageWidth, ImageHeight, ImagePitch
    std::string imageHeight = content["0028,0010"]["Value"].asString();
    LOG(INFO) << "*** ImageHeight: " << imageHeight;
    uint32_t imageHeightInt = std::stoi(imageHeight);
    std::string imageWidth = content["0028,0011"]["Value"].asString();
    LOG(INFO) << "*** ImageWidth: " << imageWidth;
    uint32_t imageWidthInt = std::stoi(imageWidth);
    float scaleFactor = 1.0;
    if (imageWidthInt > 1024 || imageHeightInt > 1024) {
      // resize the image
      if (imageWidthInt > 2048 || imageHeightInt > 2048) {
        scaleFactor = 0.25;
        LOG(INFO) << "*** Scalefactor is 0.25";
      } else {
        scaleFactor = 0.5;
        LOG(INFO) << "*** Scalefactor is 0.5";
      }
      // the filenames of the temporal saved files must be unique
      // to avoid problems in case of concurrent job threads running
      std::string dcmscaleCommand =
        "/dcmtk-3.6.4-linux-x86_64-static/bin/dcmscale -v +Sxf "
        + std::to_string(scaleFactor) + " /tmp/current-"
        + instanceId + ".dcm /tmp/scaled-" + instanceId + ".dcm";
      LOG(INFO) << "*** dcmscaleCommand: " << dcmscaleCommand;
      // Make the required system call
      int dcmscaleStatus = system(dcmscaleCommand.c_str());
      LOG(INFO) << "*** System command dcmscale status: "
        << dcmscaleStatus;
      if (dcmscaleStatus == 0) {
        // replace the current uncompressed temporary file by the scaled file
        std::string copyCommand = "cp /tmp/scaled-" + instanceId
          + ".dcm /tmp/current-" + instanceId + ".dcm";
        LOG(INFO) << "*** System command cp: " << copyCommand;
        // Make the required system call
        int copyStatus = system(copyCommand.c_str());
        LOG(INFO) << "*** Scaling copyStatus: " << std::to_string(copyStatus);
        // remove the temporary scaled file
        std::string scaledFile = "/tmp/scaled-" + instanceId + ".dcm";
        remove(scaledFile.c_str());
      }  // end dcmscaleStatus
    } else {
      // continue without scaling, image size is below level
      LOG(INFO) << "*** image width and height are below level";
    }
  } else {
    LOG(INFO) << "*** ParsingSuccessful Error: " << parsingSuccessful;
    // continue without scaling
  }
  // Bloc 2 : compress the instance
  // Path for current instance stored during anonymization
  std::string filePathIn = "/tmp/current-" + instanceId + ".dcm";
  // Path to the temporary file that will
  // contain the compressed DICOM content
  std::string filePathOut = "/tmp/compressed-" + instanceId + ".dcm";
  // Compress to JPEG2000 using gdcm
  std::string gdcmCommand =
    "/GDCM-3.0.3-Linux-x86_64/bin/gdcmconv --j2k "
    + filePathIn + " " + filePathOut;
  LOG(INFO) << "*** System command GDCM string: " << gdcmCommand;
  // Make the required system calls
  int gdcmconvStatus = system(gdcmCommand.c_str());
  LOG(INFO) << "*** System command GDCM: " << gdcmconvStatus;
  if (gdcmconvStatus == 0) {
    // Read the result of the JPEG2000 compression (Toolbox)
    OrthancPluginMemoryBuffer j2k;
    OrthancPluginErrorCode readError =
      OrthancPluginReadFile(context, &j2k, filePathOut.c_str());
    // Remove the two temporary files
    remove(filePathIn.c_str());
    remove(filePathOut.c_str());
    if (readError == 0) {
      // Upload the JPEG2000 file through the REST API with
      // unchanged instanceUID ; overwrite instances in Orthanc
      // configuration must be enabled
      OrthancPluginMemoryBuffer temp;
      OrthancPluginErrorCode storeError =
        OrthancPluginRestApiPost(context, &temp,
        "/instances", j2k.data, j2k.size);
      OrthancPluginFreeMemoryBuffer(context, &temp);
      OrthancPluginFreeMemoryBuffer(context, &j2k);
      if (storeError == 0) {
        LOG(INFO) << "*** File compression was successfull";
      } else {
        LOG(INFO) << "*** Compress store Error: " << storeError;
        ok = false;
      }  // storeStatus
    } else {
      LOG(INFO) << "*** Compress read Error: " << readError;
      OrthancPluginFreeMemoryBuffer(context, &j2k);
      ok = false;
    }  // readError
  } else {
    LOG(INFO) << "*** Compress Error: " << gdcmconvStatus;
    ok = false;
  }  // gdcmconvStatus : Bloc 2 
  return ok;
}
