# node-hue
##### disclaimer
I'm not affiliated with Philips, nor they do backup my initiative.

### what
A Philips hue bridge copycat with support third party devices.
That's it.

### why
I first stumbled on [marius motea's project](https://github.com/mariusmotea/diyHue) which sounded promising. After some time I realized its goal was not what i wanted to achieve, and didn't want to steer the project away from Marius' vision. Also, it was made in python, and i knew i could do better with my node skills.

### how
#### devices
I personally use [Wemos D1 mini](https://wiki.wemos.cc/products:d1:d1_mini) because it's cheap and good enough for the use but I guess any esp8266 based chips would run too. I use it with [Neopixels](https://www.adafruit.com/product/1138), which is a ws2812 based led strip (again, lots of compatible ones out there).

##### hardware
1. [A complete tutorial on how to solder/plug can be found at instructables](http://www.instructables.com/id/ESP8266-controlling-Neopixel-LEDs-using-Arduino-ID/).

##### software
1. You'll need a working Arduino IDE or Platform.IO environment. As for now, I only coded for devices which I'm interested into, but more could be done easily. [A video tutorial can be found on youtube if necessary](https://www.youtube.com/watch?v=q2k3CzT5qE0).

2. Make sure you erase EEPROM first by uploading the dummy eeprom clear script (`esp8266/eepprom_clear.ino`) to initialize EEPROM [reference](http://forum.arduino.cc/index.php?topic=218530.0).

3. Upload `esp8266/ws2812/ws2812.ino` to the board.

Useful things to know:

- Device advertises for itself until it is linked to the server
- Device advertises a carefully crafted `Server` header, which looks like `Arduino/1.0 UPNP/1.1 XXXXX`. That last _XXXXX_ part is used by the `src/hue` part to load the proper adapter, so it can handle any device.

##
#### server
##### kickstart
You'll need:
- nodejs

```
npm install
sudo node index.js
```

It needs sudo, because Philips mobile app doesn't care about http port and assume the bridge runs on port 80, sadly.

##### architecture
The server is cut in several parts, but they talk to each other at some point.

1. `src/ssdp` is both broadcasting (so it can be discovered by Philips mobile app) and listening for SSDP NOTIFY events which are dispatched by the crafted devices. Eventually, it will send a message on the pubsub hub so other parts of the server can catch new devices.

2. `src/hue` contains web-agnostic hue api implementation ; it's a basic _crud-to-database_ code. It will load the appropriate `src/adapters` to perform third-party instructions.

3. `src/http` is a simple webserver with multiple endpoints.
  - `src/http/upnp` only holds for ssdp based requests (such as the description file).
  - `src/http/api` contains all the endpoints of the (Philips hue APi).[https://www.developers.meethue.com/philips-hue-api]. Any of the action will call for `src/hue` functions in the end.

4. `src/adapters` contains all server-to-device specifics, so the rest of the server is device agnostic.

#### extending

To extend to new devices:

1. Code a device that advertises itself with a crafted `Server` header containing `Arduino/1.0 UPNP/1.1 {adapter_name}` and a `Chip` header containing `{type}-{unique_id}`.

2. Code the corresponding `{adapter_name}` adapter and place it into `src/adapters`.
