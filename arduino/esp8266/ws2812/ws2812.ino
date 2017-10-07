#include <EEPROM.h>

#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

#include "SSDP.h"

#include <ESP8266WebServer.h>

#include "color.h"



// mySelf
uint32_t chipId = ESP.getChipId();



// network config
bool DHCP = true; // turn to false to setup static ip
IPAddress ip      (192, 168,   1, 254);
IPAddress subnet  (255, 255, 255,   0);
IPAddress gateway (192, 168,   1,   1);



// eeprom schematic
bool link   = false;               // linked to server (false for new lamp)
Pixel color = { false, 0, 0, 0 };  // color color value
Pixel temp  = { false, 0, 0, 0 };  // for interpolation purpose



// SSDP client
SSDP ssdp;



// webserver
ESP8266WebServer server(80);
String mimetype = "application/json";

void reply(bool success, String message = "");
void reply(bool success, String message) {
  if (!success) {
    server.send(200, mimetype, "{ \"success\": false }\n\n");
    return;
  }

  if (message == "") {
    server.send(200, mimetype, "{ \"success\": true }\n\n");
  }
  else {
    server.send(200, mimetype, "{ \"success\": true, " + message + " }\n\n");
  }
}

void on404() {
  String message = "File Not Found\n\n";
  server.send(404, "text/plain", "Not Found\n\n");
}

void onLink() {
  if (!link) {
    link = true;
    EEPROM.write(0, link);
    reply(true);
    return;
  }

  reply(false);
}

void onUnlink() {
  if (link) {
    link = false;
    EEPROM.write(0, link);
    reply(true);
    return;
  }

  reply(false);
}

void onGet() {
  if (!link) {
    reply(false);
    return;
  }

  reply(true, "\"h\": " + String(color.h) + ", \"s\": " + String(color.s) + ", \"l\": " + String(color.l));
}

void onSet() {
  if (!link) {
    reply(false);
    return;
  }

  if (!server.hasArg("h") || !server.hasArg("s") || !server.hasArg("l")) {
    reply(false);
    return;
  }

  color.h = server.arg("h").toFloat();
  color.s = server.arg("s").toFloat();
  color.l = server.arg("l").toFloat();
  reply(true);
}

void onOn() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = true;
  reply(true);
}

void onOff() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = false;
  reply(true);
}

void onToggle() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = !color.status;

  String status =  (color.status ? "true" : "false");
  reply(true, "\"status\": " + status);
}



// light managment
void light() {
  // TODO: tween hsl values and apply to neopixel lib
}



void setup() {
  Serial.begin(9600);
  Serial.println(chipId);

  EEPROM.begin(512);
  pinMode(LED_BUILTIN, OUTPUT);

  // led on => setup
  digitalWrite(LED_BUILTIN, LOW);

  // network setup
  if (!DHCP) {
    WiFi.config(ip, gateway, subnet);
  }

  // wifi setup
  WiFiManager wifi;
  wifi.autoConnect("esp8266-ws2812");

  // yummy ota
  ArduinoOTA.setPort(8266);
  ArduinoOTA.begin();

  // led off => all good
  digitalWrite(LED_BUILTIN, HIGH);


  // ssdp server kickoff
  ssdp.setModelName("esp8266");
  ssdp.setModelNumber("ws2812");
  ssdp.setHTTPPort(80);
  ssdp.setSchemaURL("description.xml");
  ssdp.setType("light");
  ssdp.begin();


  // webserver routing
  char routeLink[12];
  sprintf(routeLink, "/%06x/link", chipId);
  server.on(routeLink, HTTP_POST, onLink);

  char routeUnlink[14];
  sprintf(routeUnlink, "/%06x/unlink", chipId);
  server.on(routeUnlink, HTTP_POST, onUnlink);

  char routeGet[11];
  sprintf(routeGet, "/%06x/get", chipId);
  server.on(routeGet, HTTP_GET, onGet);

  char routeSet[11];
  sprintf(routeSet, "/%06x/set", chipId);
  server.on(routeSet, HTTP_POST, onSet);

  char routeOn[10];
  sprintf(routeOn, "/%06x/on",  chipId);
  server.on(routeOn, HTTP_POST, onOn);

  char routeOff[11];
  sprintf(routeOff, "/%06x/off", chipId);
  server.on(routeOff, HTTP_POST, onOff);

  char routeToggle[14];
  sprintf(routeToggle, "/%06x/toggle", chipId);
  server.on(routeToggle, HTTP_POST, onToggle);

  server.onNotFound(on404);

  // webserver kickoff
  server.begin();


  // get default state of application
  link = (EEPROM.read(0) == 1);
}

void loop() {
  ArduinoOTA.handle();
  server.handleClient();
  light();

  if (!link) {
    ssdp.notify();
  }
}

