# Gamut to model-id conversion

The app will calibrate the colorpicker depending on the model id, in order to respect the device's gamut. As we use third party leds, with an unknown gamut, we must comply to a known model id to get coherent gamut with the rest of the room. To do so, when the device is linked to the bridge, a designated model id is given to fake the device as a philips one (_you also get a nice icon displayed in the app_).

The full list of valid model id is available at [philips hue api documentation](https://developers.meethue.com/documentation/supported-lights) but here's what can make you started easily :

![gamuts](http://www.developers.meethue.com/sites/default/files/gamut_0.png)

Gamut range | Product style | Model-id
------------|---------------|----------
A           | Bulb bowl     | LLC014
A           | Led strip     | LST001
B           | Led bulb      | LLM001
C           | Led bulb      | LCT014
C           | Led strip     | LCT002

Note that by the model ids, and the capabilities (zigbee device id), it seems like old devices where having A gamut, and now devices are shifting up to B or C.
