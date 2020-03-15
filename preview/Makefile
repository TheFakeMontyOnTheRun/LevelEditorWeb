

native:
	$(CXX) -Iinclude src/demo.cpp -c -o obj/demo.o
	$(CC)  obj/demo.o -odemo

wasm:
	em++ src/demo.cpp -Os -s WASM=1 -s SIDE_MODULE=1 -c -o obj/demo.o
	emcc obj/demo.o -Os -s WASM=1 -s SIDE_MODULE=1 -o demo.wasm

clean:
	rm -f obj/*
	rm -f demo.wasm
	rm -f demo
all:
	echo "make your mind!"