#ifndef ssdp_h
#define ssdp_h

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

class UdpContext;

#define SSDP_MODEL_NAME_SIZE        64
#define SSDP_MODEL_VERSION_SIZE     32
#define SSDP_UUID_SIZE              37
#define SSDP_DEVICE_TYPE_SIZE       64
#define SSDP_SCHEMA_URL_SIZE        64
#define SSDP_FRIENDLY_TYPE_SIZE     64

typedef enum {
  NOTIFY
} ssdp_method_t;


class SSDP {
  public:
    SSDP();

    bool begin();
    void notify();

    void setModelName(const String& name) { setModelName(name.c_str()); }
    void setModelName(const char *name);
    void setModelNumber(const String& num) { setModelNumber(num.c_str()); }
    void setModelNumber(const char *num);
    void setDeviceType(const String& deviceType) { setDeviceType(deviceType.c_str()); }
    void setDeviceType(const char *deviceType);
    void setHTTPPort(uint16_t port);
    void setSchemaURL(const String& url) { setSchemaURL(url.c_str()); }
    void setSchemaURL(const char *url);
    void setType(const String& url) { setType(url.c_str()); }
    void setType(const char *url);

  protected:
    UdpContext* _server;

    char _modelName[SSDP_MODEL_NAME_SIZE];
    char _modelNumber[SSDP_MODEL_VERSION_SIZE];

    char _uuid[SSDP_UUID_SIZE];
    char _deviceType[SSDP_DEVICE_TYPE_SIZE];

    uint16_t _port;
    char _schemaURL[SSDP_SCHEMA_URL_SIZE];
    char _type[SSDP_FRIENDLY_TYPE_SIZE];

    uint32_t _now;
};

#endif
