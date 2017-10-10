#include <EEPROM.h>

#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

#include "SSDP.h"

#include <ESP8266WebServer.h>

#include <FastLED.h>



// utils
struct Pixel {
  bool  status;
  float h;
  float s;
  float v;
};

// float fmod
float ffmod(float a, float b) { return (a - b * floor(a / b)); }



// mySelf
uint32_t chipId = ESP.getChipId();



// network config
bool DHCP = true; // turn to false to setup static ip
IPAddress ip      (192, 168,   1, 254);
IPAddress subnet  (255, 255, 255,   0);
IPAddress gateway (192, 168,   1,   1);



// eeprom schematic
#define LINK 16
bool link   = false;               // linked to server (false for new lamp)
Pixel color = { true, 0, 0, 0 };   // color color value



// ws2812 configuration
#define FASTLED_ESP8266_NODEMCU_PIN_ORDER
#define TYPE WS2812B
#define PIN D6
#define COLOR GRB
#define LENGTH 60
#define FPS 100
CRGB leds[LENGTH];



// light managment related
float easing = 0.05;                // easing factor
float soften = 0.01;                // softening threshold
Pixel temp   = { true, 0, 0, 0 };   // for interpolation purpose
bool stable  = true;                // to skip interpolation when not needed
bool around  = false;               // used to determine direction of rotation in the hue wheel



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
    EEPROM.write(LINK, 0xff);
    EEPROM.commit();
    reply(true);
    return;
  }

  reply(false);
}

void onUnlink() {
  if (link) {
    link = false;
    EEPROM.write(LINK, 0x00);
    EEPROM.commit();
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

  reply(true, "\"status\": " + String(color.status) + ", \"h\": " + String(color.h) + ", \"s\": " + String(color.s) + ", \"v\": " + String(color.v));
}

void onSet() {
  if (!link) {
    reply(false);
    return;
  }

  if (!server.hasArg("h") || !server.hasArg("s") || !server.hasArg("v") || !server.hasArg("status")) {
    reply(false);
    return;
  }

  // set status
  if (server.hasArg("status")) {
    color.status = server.arg("status").toInt() == 1;
  }

  // take down color to a 0-360 range
  if (!stable) {
    color.h = ffmod(color.h, 360);
    temp.h  = ffmod(temp.h, 360);
  }

  // get raw hue
  float h = server.arg("h").toFloat();

  // get shortest direction to color
  if (color.h - h < -180) { h -= 360; }
  else if (color.h - h > 180) { h += 360; }

  // set color
  color.h = h;
  color.s = server.arg("s").toFloat();
  color.v = server.arg("v").toFloat();

  // invalidate  
  stable = false;
  
  reply(true);
}

void onOn() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = true;
  stable = false;
  
  reply(true);
}

void onOff() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = false;
  stable = false;
  
  reply(true);
}

void onToggle() {
  if (!link) {
    reply(false);
    return;
  }

  color.status = !color.status;
  stable = false;

  String status =  (color.status ? "true" : "false");
  reply(true, "\"status\": " + status);
}



// light managment
void light() {
  if (stable) {
    return;
  }

  // luminosity can be toggled
  float v = color.status ? color.v : 0;

  // classic easing
  temp.h += (color.h - temp.h) * easing;
  temp.s += (color.s - temp.s) * easing;
  temp.v += (v - temp.v) * easing;

  // after some time, values will soften down to 0 indefinitely, so we need to stop it manually
  if ((abs(color.h - temp.h) < soften) && abs(color.s - temp.s) < soften && abs(v - temp.v) < soften) {
    // take down color to a 0-360 range
    color.h = ffmod(color.h, 360);

    // copy color values for next starting point
    temp.h = color.h;
    temp.s = color.s;
    temp.v = v;

    // force-stop the light loop
    stable = true;
  }

  // apply to neopixel
  for (uint8_t i = 0; i < LENGTH; i++) {
    hsv2rgb_spectrum(
      CHSV(
        0xff * (ffmod(temp.h, 360) / 360), // apply FastLED policy about H
        constrain(temp.s, 0, 0xff),        // apply FastLED policy about S
        constrain(temp.v, 0, 0xff)         // apply FastLED policy about V
      ),
      leds[i]
     );
  }

  FastLED.show();
  FastLED.delay(1000 / FPS);
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

  // ledstrip kickoff
  FastLED.addLeds<TYPE, PIN, COLOR>(leds, LENGTH).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(255); // full power

  // get default state of application
  link = (EEPROM.read(LINK) == 0xff);
}

void loop() {
  ArduinoOTA.handle();
  server.handleClient();
  light();

  if (!link) {
    ssdp.notify();
  }
}

