#include <stdint.h>

extern "C" int func() {
  return 42;
}

extern "C" void getPixels(uint8_t *buffer, uint32_t sizeX, uint32_t sizeY) {
  int c;
  
  for ( c = 0; c < sizeX / 2; ++c ) {
    buffer[(sizeX * c) + c ] = 1;
  }
}
