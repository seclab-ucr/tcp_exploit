LIBS = 
SRC = main.c \
      websocket.c \
      sha1.c \
      base64.c
HEADER = -I/usr/include
CXXFLAGS = -Wall -O2
OBJS = $(SRC:%.c=%.o)
CC = g++
all: $(OBJS)
	$(CC) -o websocket $^ $(CXXFLAGS) $(HEADER) $(LIBS)

main.o: main.c websocket.h
	$(CC) $(CXXFLAGS) -c $< -o $@
websocket.o: websocket.c websocket.h sha1.h base64.h
	$(CC) $(CXXFLAGS) -c $< -o $@
sha1.o: sha1.c sha1.h
	$(CC) $(CXXFLAGS) -c $< -o $@
base64.o: base64.c base64.h
	$(CC) $(CXXFLAGS) -c $< -o $@
clean:
	rm -f *.o
