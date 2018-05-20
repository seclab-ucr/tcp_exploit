#include <netinet/tcp.h>

#include "server.h"
#include "websocket/websocket.h"

int Global_websocket_fd = -1;
pthread_mutex_t socket_lock, nfq_lock;

void* server_listening(void* data) {
	int sockfd, newsockfd, portno = MYPORT;
	socklen_t clilen;
	// char buffer[256];
	struct sockaddr_in serv_addr, cli_addr;
	// int n;
	int optval = 1;
	if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
		perror("Error opening socket");
	}
	setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);
	setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &optval, sizeof optval);
	bzero((char *) &serv_addr, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_addr.s_addr = INADDR_ANY;
	serv_addr.sin_port = htons(portno);
	if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
		perror("Error on binding");
	}
	printf("server listening on %d\n", portno);
	listen(sockfd, 5);
	clilen = sizeof(cli_addr);

	while (1) {
		printf("waiting for connection\n");
		pthread_mutex_lock(&nfq_lock);
		pthread_mutex_lock(&socket_lock);
		if ((newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen)) == -1) {
			printf("Error on accept\n");
			continue;
		}
		printf("accept\n");
		Global_websocket_fd = newsockfd;
		pthread_mutex_unlock(&socket_lock);
	}

	close(sockfd);
	return NULL;
}

void* websocket_listening(void* data) {
	int sockfd, newsockfd;
	// uint64_t length;
	// unsigned char buffer[1024];

	websocket_init(sockfd, MYPORT);
	while (1) {
		pthread_mutex_lock(&nfq_lock);
		pthread_mutex_lock(&socket_lock);
		if (websocket_accept(sockfd, newsockfd) <0) {
		    printf("%s: %d\n", "Error on accept", newsockfd);
		    continue;
	    }
	    printf("accept\n");
	    if (websocket_handshake(newsockfd) < 0) {
		    continue;
	    }
	    printf("complete handshake\n");

	    Global_websocket_fd = newsockfd;
	    pthread_mutex_unlock(&socket_lock);
	}
	websocket_close(sockfd);
	return NULL;
}

void thread_server_start() {
	pthread_t child;
	pthread_attr_t attr;

	pthread_attr_init(&attr);
	pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
	pthread_mutex_init(&socket_lock, NULL);
	pthread_mutex_init(&nfq_lock, NULL);
	
#ifdef WEBSOCKET
    if (pthread_create(&child, &attr, websocket_listening, NULL) != 0) {
		perror("thread create\n");
	}
#else
	if (pthread_create(&child, &attr, server_listening, NULL) != 0) {
		perror("thread create\n");
	}
#endif
}

static bool if_exist(struct Hosts* hosts, char* ip) {
	for (int i = 0; i < hosts->num; i++) {
		if (!strcmp(hosts->ips[i], ip)) {
			return true;
		}
	}
	return false;
}

struct Hosts* getipbyhostname(char* hostname) {
	int rv;
	struct addrinfo hints, *servinfo, *p;
	struct sockaddr_in *addr;
	struct Hosts* ret = (struct Hosts*)malloc(sizeof(struct Hosts));
	char* s = NULL;
	ret->num = 0;
	memset(&hints, 0, sizeof hints);
	if ((rv = getaddrinfo(hostname, "http", &hints, &servinfo)) != 0) {
		fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
		exit(1);
	}

	for (p = servinfo; p != NULL; p = p->ai_next) {
		if (p->ai_addr && p->ai_family == AF_INET) {
			printf("find one\n");
			addr = (struct sockaddr_in*)(p->ai_addr);
			s = (char*)malloc(INET_ADDRSTRLEN);
			inet_ntop(AF_INET, &(addr->sin_addr), s, INET_ADDRSTRLEN);
			if (!if_exist(ret, s)) {
				ret->ips[ret->num++] = s;
			}
			// return s;
			// break;
		}
	}
	return ret;
}