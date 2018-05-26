#ifndef SERVER_H
#define SERVER_H

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <string.h>
#include <pthread.h>
#include <netdb.h>

//global variables
extern int Global_websocket_fd;
extern pthread_mutex_t socket_lock, nfq_lock;

struct Hosts {
	int num;
	char* ips[5];
};

void thread_server_start();
struct Hosts* getipbyhostname(char* hostname);

#endif