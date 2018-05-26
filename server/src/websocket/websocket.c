#include <stdio.h>
#include <stdint.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#include "sha1.h"
#include "base64.h"
#include "websocket.h"

#define BUFFER_SIZE 1024

int websocket_init(int &sockfd, uint16_t port) {
	struct sockaddr_in server;
	int optval = 1;

    bzero((char *) &server, sizeof(server));
	server.sin_family = AF_INET;
	server.sin_port = htons(port);
	server.sin_addr.s_addr = htonl(INADDR_ANY);
	if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
		perror("Error opening socket");
		goto error;
	}
	setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);
	setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &optval, sizeof optval);
	if (bind(sockfd, (struct sockaddr *) &server, sizeof(server)) < 0) {
		perror("Error on binding");
		goto error;
	}
	printf("server listening on %d\n", port);
	listen(sockfd, 5);
	return 0;
error:
    return -1;
}

int websocket_accept(int sockfd, int &newsockfd) {
	struct sockaddr_in cli_addr;
	socklen_t clilen = sizeof(sockaddr_in);
	if ((newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen)) == -1) {
		perror("Error on accept");
		return -1;
	}
	return 0;
}

void websocket_close(int sockfd) {
	int ret = close(sockfd);
    printf("close: %d\n", ret);
}

int websocket_handshake(int sockfd) {
	char buffer[BUFFER_SIZE];
	char *header = NULL, *tok = NULL, *key = NULL;
	int n, len = strlen("Sec-WebSocket-Key: ");
	char concat[1024];
	char sha1buf[45];
	char *base64buf = NULL;
	unsigned char sha1mac[20];
	const char *GID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	SHA1Context shactx;
	SHA1Reset(&shactx);

	n = recv(sockfd, buffer, BUFFER_SIZE, 0);
	header = (char *)malloc(n+1);
	strncpy(header, buffer, n);
	for (tok = strtok(header, "\r\n"); tok != NULL; tok = strtok(NULL, "\r\n")) {
		if (strstr(tok, "Sec-WebSocket-Key: ") != NULL) {
			key = (char *)malloc(strlen(tok)-len+1);
			strncpy(key, tok + len, strlen(tok)-len+1);
			break;
		}
	}

	if (key == NULL) {
		perror("Unable to find key in request headers.");
		goto Error;
	}

	memset(concat, 0, sizeof(concat));
	strncat(concat, key, strlen(key));
	strncat(concat, GID, strlen(GID));
	SHA1Input(&shactx, (unsigned char *) concat, strlen(concat));
	SHA1Result(&shactx);
	sprintf(sha1buf, "%08x%08x%08x%08x%08x", shactx.Message_Digest[0],
			shactx.Message_Digest[1], shactx.Message_Digest[2],
			shactx.Message_Digest[3], shactx.Message_Digest[4]);
	for (n = 0; n < (int)(strlen(sha1buf) / 2); n++) {
		sscanf(sha1buf + (n * 2), "%02hhx", sha1mac + n);
	}
	base64buf = (char *) malloc(256);
	base64_encode(sha1mac, 20, base64buf, 256);

	//response
	memset(buffer, 0, BUFFER_SIZE);
	snprintf(buffer, BUFFER_SIZE, "HTTP/1.1 101 Switching Protocols\r\n"
			"Upgrade: websocket\r\n"
			"Connection: Upgrade\r\n"
			"Sec-WebSocket-Accept: %s\r\n\r\n", base64buf);
	send(sockfd, buffer, strlen(buffer), 0);

    free(header);
	free(key);
	free(base64buf);
	return 0;
Error:
    return -1;
}

static void websocket_recvn(int sockfd, unsigned char* buffer, int length) {
	int n;
	while (length > 0) {
		n = recv(sockfd, buffer, length, 0);
		length -= n;
		buffer += n;
	}
}

static void websocket_sendn(int sockfd, unsigned char* buffer, int length) {
	int n;
	while (length > 0) {
		n = send(sockfd, buffer, length, 0);
		length -= n;
		buffer += n;
	}
}

unsigned char* websocket_recv_frame(int sockfd, uint64_t* length, unsigned char* finished) {
	unsigned char header[MAX_FRAME_HEADER_SIZE];
	int pos = 0;
	uint64_t i;
	uint64_t frame_size;
	unsigned char fin, mask, opcode;
	unsigned char masks[4];
	unsigned char* buffer = NULL;

    websocket_recvn(sockfd, header, 2);
    pos += 2;
    frame_size = GET_LENGTH(header[1]);
    fin = GET_FIN(header[0]);
    mask = GET_MASK(header[1]);
    opcode = GET_OPCODE(header[0]);

    if (opcode != TEXT_FRAME && opcode != BINARY_FRAME && opcode != CONTINUE_FRAME) {
    	perror("Unknown opcode!");
    	goto Error;
    }

    if (frame_size == 126) {
    	websocket_recvn(sockfd, header+pos, 2);
    	pos += 2;
    	frame_size = *(uint16_t *)(header+2);
    } else if (frame_size == 127) {
    	websocket_recvn(sockfd, header+pos, 8);
    	pos += 8;
    	frame_size = *(uint64_t *)(header+2);
    }

    if (mask) {
    	websocket_recvn(sockfd, header+pos, 4);
    	memcpy((char*)masks, (char*)header+pos, 4);
    	pos += 4;
    	// printf("%x%x%x%x ", masks[0], masks[1], masks[2], masks[3]);
    }

    *length = frame_size;
    *finished = fin;
    buffer = (unsigned char*)malloc(frame_size);
    websocket_recvn(sockfd, buffer, frame_size);
    if (mask) {
    	for (i = 0; i < frame_size; i++) {
    		// printf("%x %x\n", buffer[i], buffer[i]^masks[i%4]);
    		buffer[i] ^= masks[i%4];
    	}
    }

    return buffer;
Error:
    return NULL;
}

uint64_t websocket_recv_frag(int sockfd, unsigned char* buffer, uint64_t buffer_size) {
	unsigned char fin = 0;
	uint64_t length, recved = 0;
	unsigned char* response;

	while (fin == 0) {
		response = websocket_recv_frame(sockfd, &length, &fin);
		if (response == NULL) {
			goto Error;
		}
		if (recved + length > buffer_size) {
			perror("recved data size is too large");
			goto Error;
		}
		strncpy((char*)buffer+recved, (char*)response, length);
		free(response);
		recved += length;
	}
	buffer[recved] = '\0';	
	return recved;

Error:
    return -1;
}

char* websocket_make_frame(unsigned char* data, uint64_t length,
	WebSocketFrameType type, unsigned char mask, int &size) {
	unsigned char flags = (unsigned char)type + (1 << 7);
	int pos = 0, i;
	unsigned char masks[4];
	unsigned char header[MAX_FRAME_HEADER_SIZE];
	char *buffer = NULL;

	header[pos++] = flags;
	if (length < 126) {
		header[pos++] = length + (mask << 7);
	} else if (length <= 65535) {
		header[pos++] = 126 + (mask << 7);
		header[pos++] = (length >> 8) & 0xff;
		header[pos++] = length & 0xff;
	} else {
		header[pos++] = 127 + (mask << 7);
		for (i = 7; i >= 0; i--) {
			header[pos++] = ((length >> 8*i) & 0xff);
		}
	}

	if (mask) {
		for (i = 0; i < 4; i++) {
			masks[i] = (unsigned char)i;
			header[pos++] = masks[i];
		}
	}

	buffer = (char*)malloc(pos+length);
	strncpy(buffer, (char *)header, pos);
	strncpy(buffer+pos, (char *)data, length);
	size = pos + length;
	return buffer;
}

int websocket_send_frame(int sockfd, unsigned char* data, uint64_t length, 
	WebSocketFrameType type, unsigned char mask) {
	int size;
	char *buffer = websocket_make_frame(data, length, type, mask, size);
	websocket_sendn(sockfd, (unsigned char*)buffer, size);
	free(buffer);
	
	return length;
}
