#pragma once

#ifndef PARSE_H
#define PARSE_H

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <netinet/in.h>
#include <netinet/tcp.h>

struct Packet {
	char sip[INET_ADDRSTRLEN];
	char dip[INET_ADDRSTRLEN];
	uint16_t sport;
	uint16_t dport;
	char *payload;
	uint64_t size;
	uint32_t seq;
	uint32_t ack;
	uint32_t tstamp, echo;
};

uint32_t get_timestamp(struct iphdr* packet_header, unsigned char* payload, unsigned int len);
uint16_t get_dport(struct iphdr* packet_header, unsigned char* payload, int len);
int get_ip(struct iphdr* packet_header, unsigned char* payload, 
    int len, Packet *packet);
uint32_t get_ack(struct iphdr* packet_header, unsigned char* payload, int len);
uint32_t get_seq(struct iphdr* packet_header, unsigned char* payload, int len);
int parse_ip_packet(struct iphdr* packet_header, unsigned char* payload, 
	int len, Packet* packet, bool new_data);
char* retrieve_text_payload(struct iphdr* packet_header, unsigned char* payload, int len);

#endif