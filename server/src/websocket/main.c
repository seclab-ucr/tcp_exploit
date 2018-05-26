#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "websocket.h"

int main() {
	int sockfd, newsockfd;
	uint64_t length;
	unsigned char buffer[1024];

	websocket_init(sockfd, 30006);
	if (websocket_accept(sockfd, newsockfd) <0) {
		printf("%s: %d\n", "Error on accept", newsockfd);
		return 1;
	}
    printf("Accept: %d\n", newsockfd);
    printf("Start handshake\n");

	if (websocket_handshake(newsockfd) < 0) {
		return 1;
	}
	printf("handshake successfully\n");

	if ((length = websocket_recv_frag(newsockfd, buffer, 1024)) > 0) {
		buffer[length] = '\0';
		printf("%s\n", buffer);

		websocket_send_frame(newsockfd, buffer, strlen((char*)buffer), TEXT_FRAME, 1);
	}

	websocket_close(newsockfd);
	websocket_close(sockfd);
	return 0;
}