#ifndef ws2812_utils
#define ws2812_utils

struct Pixel {
  bool  status;
  float h;
  float s;
  float l;
};

inline uint32_t hsl2rgb(struct Pixel pixel) {
  unsigned int hue = round(constrain(pixel.h, 0, 360)) % 360;
  unsigned int sat = (int)map(constrain(pixel.s, 0, 100), 0, 100, 0, 255);
  unsigned int lum = (int)map(constrain(pixel.l, 0, 100), 0, 100, 0, 255);

  byte r = 0;
  byte g = 0;
  byte b = 0;
  byte w = 0;

  if (sat == 0) {
    r = lum;
    g = lum;
    b = lum;
    w = 0;
  }
  else {
    unsigned int base = ((255 - sat) * lum) >> 8;
    w = 255 - sat;

    switch (hue / 60) {
      case 0:
        r = lum;
        g = (((lum - base) * hue) / 60) + base;
        b = base;
        break;

      case 1:
        r = (((lum - base) * (60 - (hue % 60))) / 60) + base;
        g = lum;
        b = base;
        break;

      case 2:
        r = base;
        g = lum;
        b = (((lum - base) * (hue % 60)) / 60) + base;
        break;

      case 3:
        r = base;
        g = (((lum - base)*(60 - (hue % 60))) / 60) + base;
        b = lum;
        break;

      case 4:
        r = (((lum - base) * (hue % 60)) / 60) + base;
        g = base;
        b = lum;
        break;

      case 5:
        r = lum;
        g = base;
        b = (((lum - base) * (60 - (hue % 60))) / 60) + base;
        break;
    }
  }

  return (uint32_t)w << 24 | (uint32_t)r << 16 | (uint32_t)g << 8 | (uint32_t)b;
}

/*
inline uint32_t hsl2rgbw(struct Pixel pixel) {
  byte r = 0;
  byte g = 0;
  byte b = 0;
  byte w = 0;

  float cos_h, cos_1047_h;

  float hue = fmod(pixel.h, 360);
  hue = 3.14159 * hue / 180;

  float sat = constrain(pixel.s, 0, 100) / 100;
  float lum = constrain(pixel.l, 0, 100) / 100;

  if(hue < 2.09439) {

    cos_h = cos(hue);
    cos_1047_h = cos(1.047196667 - hue);

    r = sat * 255 * lum / 3 * (1 + cos_h / cos_1047_h);
    g = sat * 255 * lum / 3 * (1 + (1 - cos_h / cos_1047_h));
    b = 0;
    w = 255 * (1 - sat) * lum;

  }
  else if (hue < 4.188787) {

    hue = hue - 2.09439;

    cos_h = cos(hue);
    cos_1047_h = cos(1.047196667 - hue);

    g = sat * 255 * lum / 3 * (1 + cos_h / cos_1047_h);
    b = sat * 255 * lum / 3 * (1 + (1 - cos_h / cos_1047_h));
    r = 0;
    w = 255 * (1 - sat) * lum;

  }
  else {

    hue = hue - 4.188787;

    cos_h = cos(hue);
    cos_1047_h = cos(1.047196667 - hue);

    b = sat * 255 * lum / 3 * (1 + cos_h / cos_1047_h);
    r = sat * 255 * lum / 3 * (1 + (1 - cos_h / cos_1047_h));
    g = 0;
    w = 255 * (1 - sat) * lum;
  }

  return (uint32_t)w << 24 | (uint32_t)r << 16 | (uint32_t)g << 8 | (uint32_t)b;
}
*/

#endif

