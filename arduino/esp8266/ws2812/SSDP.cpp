#define LWIP_OPEN_SRC
#include <functional>
#include "ssdp.h"
#include "WiFiUdp.h"
#include "debug.h"

extern "C" {
  #include "osapi.h"
  #include "ets_sys.h"
  #include "user_interface.h"
}

#include "lwip/opt.h"
#include "lwip/udp.h"
#include "lwip/inet.h"
#include "lwip/igmp.h"
#include "lwip/mem.h"
#include "include/UdpContext.h"

#define SSDP_INTERVAL     1200
#define SSDP_METHOD_SIZE  10
#define SSDP_URI_SIZE     2
#define SSDP_BUFFER_SIZE  64
#define SSDP_MULTICAST_TTL 2


// multicast network coordinates
static const IPAddress SSDP_MULTICAST_ADDR(239, 255, 255, 250);
static const uint16_t  SSDP_PORT = 1900;


// notify template
static const char _ssdp_packet_template[] PROGMEM =
  "NOTIFY * HTTP/1.1\r\n"
  "HOST: 239.255.255.250:1900\r\n"
  "NTS: ssdp:alive\r\n"
  "CACHE-CONTROL: max-age=%u\r\n"
  "SERVER: Arduino/1.0 UPNP/1.1 %s/%s\r\n"
  "USN: uuid:%s\r\n"
  "NT: %s\r\n"
  "LOCATION: http://%u.%u.%u.%u:%u/%s\r\n"
  "Chip: %s-%06x\r\n"
  "\r\n";


// constructor
SSDP::SSDP() :
_server(0),
_port(80)
{
  _modelName[0] = '\0';
  _modelNumber[0] = '\0';
  sprintf(_deviceType, "urn:schemas-upnp-org:device:basic:1");
  _uuid[0] = '\0';
  sprintf(_schemaURL, "ssdp/schema.xml");
  '\0';
}

// methods
bool SSDP::begin() {
  uint32_t chipId = ESP.getChipId();
  sprintf(_uuid, "38323636-4558-4dda-9188-cda0e6%02x%02x%02x",
    (uint16_t) ((chipId >> 16) & 0xff),
    (uint16_t) ((chipId >>  8) & 0xff),
    (uint16_t)   chipId        & 0xff);

  if (_server) {
    _server->unref();
    _server = 0;
  }

  _server = new UdpContext;
  _server->ref();

  ip_addr_t ifaddr;
  ifaddr.addr = WiFi.localIP();
  
  ip_addr_t multicast_addr;
  multicast_addr.addr = (uint32_t) SSDP_MULTICAST_ADDR;
  
  _server->setMulticastInterface(ifaddr);
  _server->setMulticastTTL(SSDP_MULTICAST_TTL);
  
  return true;
}

void SSDP::notify() {
  // debounce
  if (millis() - _now < SSDP_INTERVAL) { return; }
  else { _now = millis(); }

  // notify
  uint32_t chipId = ESP.getChipId();
  ssdp_method_t method = NOTIFY;
  
  char buffer[1460];
  uint32_t ip = WiFi.localIP();

  int len = snprintf_P(buffer, sizeof(buffer),
    _ssdp_packet_template,
    SSDP_INTERVAL,
    _modelName, _modelNumber,
    _uuid,
    _deviceType,
    IP2STR(&ip), _port, _schemaURL,
    _type, chipId
  );

  ip_addr_t multicast_addr;
  multicast_addr.addr = (uint32_t) SSDP_MULTICAST_ADDR;

  _server->append(buffer, len);
  _server->send(&multicast_addr, SSDP_PORT);
}

// setters
void SSDP::setModelName(const char *name) {
  strlcpy(_modelName, name, sizeof(_modelName));
}

void SSDP::setModelNumber(const char *num) {
  strlcpy(_modelNumber, num, sizeof(_modelNumber));
}

void SSDP::setDeviceType(const char *deviceType) {
  strlcpy(_deviceType, deviceType, sizeof(_deviceType));
}

void SSDP::setHTTPPort(uint16_t port) {
  _port = port;
}

void SSDP::setSchemaURL(const char *url) {
  strlcpy(_schemaURL, url, sizeof(_schemaURL));
}

void SSDP::setType(const char *type) {
  strlcpy(_type, type, sizeof(_type));
}
