LIBS = -lnfnetlink -lnetfilter_queue -lpthread -lrt
SRC = main.c \
      server.c \
      sendtcp.c \
      hping2.c \
      parse.c \
      websocket/websocket.c \
      websocket/base64.c \
      websocket/sha1.c \


HEADER = -I/usr/include
CXXFLAGS = -Wall -O2 -DWEBSOCKET -DMYPORT=30006 -DSERVER_HOST="\"www.cnn.com\"" -DSOCKETS_NUM=1 -DAUTO_ADJUST \
	-DDEBUG -DSEQ_DELTA=1638
OBJS = $(SRC:%.c=%.o)
CC = g++
all: $(OBJS)
	$(CC) -o server $^ $(CXXFLAGS) $(HEADER) $(LIBS)
main.o: main.c server.h hping2.h parse.h websocket/websocket.h
	$(CC) $(CXXFLAGS) -c $< -o $@
server.o: server.c server.h websocket/websocket.h
	$(CC) $(CXXFLAGS) -c $< -o $@
sendtcp.o: sendtcp.c hping2.h
	$(CC) $(CXXFLAGS) -c $< -o $@
hping2.o: hping2.c hping2.h
	$(CC) $(CXXFLAGS) -c $< -o $@
parse.o: parse.c parse.h packet.h
	$(CC) $(CXXFLAGS) -c $< -o $@
clean:
	rm -f *.o
	rm -f websocket/*.o
