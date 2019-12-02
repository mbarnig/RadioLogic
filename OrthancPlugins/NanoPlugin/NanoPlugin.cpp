#include <Plugins/Samples/Common/OrthancPluginCppWrapper.h>
#include <Core/SystemToolbox.h>
#include <Core/Toolbox.h>
#include <Core/Logging.h>
#include <string>

void Moien(OrthancPluginRestOutput* output,
  const char* url, const OrthancPluginHttpRequest* request) {
  OrthancPluginContext* context = OrthancPlugins::GetGlobalContext();
  std::string HtmlCode = "<html>\n<head>\n<title>NanoPlugin</title>\n</head>\n<body>\n<h2>Moien Orthanc</h2>\n</body>\n</html>\n";
  OrthancPluginAnswerBuffer(context, output, HtmlCode.c_str(), HtmlCode.length(), "text/html");
}

extern "C"
{
  ORTHANC_PLUGINS_API int32_t OrthancPluginInitialize(OrthancPluginContext* context)
  {
    Orthanc::Logging::Initialize(context);
    OrthancPlugins::SetGlobalContext(context);
    OrthancPluginSetDescription(context, "Orthanc Plugin Test with Framework; do HTTP GET call to <RadioLogicArchive IP>/moien");
    OrthancPlugins::RegisterRestCallback<Moien>("/moien", true);
    return 0;
  }
  ORTHANC_PLUGINS_API void OrthancPluginFinalize()
  {
    LOG(INFO) << "NanoPlugin is finalizing";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetName()
  {
    return "NanoPlugin";
  }
  ORTHANC_PLUGINS_API const char* OrthancPluginGetVersion()
  {
    return "1.0.0";
  }
}