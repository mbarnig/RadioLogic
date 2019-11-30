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

#ifndef RADIOLOGICTOOLS_H
#define RADIOLOGICTOOLS_H

#include <string>
#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>

void ParseJsonBody(Json::Value& target,
  const OrthancPluginHttpRequest* request);
bool LookupStringValue(std::string& target,
  const Json::Value& json, const std::string& key);
bool CompressAndScaleDicomImage(std::string instanceId);
#endif
