#ifndef _WEBSOCKET_H
#define _WEBSOCKET_H

#include <stdint.h>
#include <stdio.h>

#define MAX_FRAME_HEADER_SIZE 16
#define GET_OPCODE(bits) (bits & 0x0f)
#define GET_FIN(bits) ((bits >> 7) & 0x1)
#define GET_MASK(bits) ((bits >> 7) & 0x1)
#define GET_LENGTH(bits) (bits & ~0x80)

enum WebSocketFrameType {
	CONTINUE_FRAME=0x0,
	TEXT_FRAME=0x1,
	BINARY_FRAME=0x2,
	PING_FRAME=0x9,
	PONG_FRAME=0xA
};

int websocket_init(int &sockfd, uint16_t port);
int websocket_accept(int sockfd, int &newsockfd);
void websocket_close(int sockfd);
int websocket_handshake(int sockfd);
unsigned char* websocket_recv_frame(int sockfd, uint64_t* length, unsigned char* finished);
uint64_t websocket_recv_frag(int sockfd, unsigned char* buffer, uint64_t buffer_size);
int websocket_send_frame(int sockfd, unsigned char* data, uint64_t length, 
	WebSocketFrameType type, unsigned char mask);
char* websocket_make_frame(unsigned char* data, uint64_t length,
	WebSocketFrameType type, unsigned char mask, int &size);
#endif