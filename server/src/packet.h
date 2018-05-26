#pragma once 
#ifndef PACKET_H
#define PACKET_H

#include <linux/ip.h>
#include <linux/types.h>

typedef enum
{
	IP_PROTOCOL_ICMP = 1,
	IP_PROTOCOL_IGMP = 2,
	IP_PROTOCOL_TCP = 6,
	IP_PROTOCOL_UDP = 17
} ip_protocol_enum;

struct cb_data
{
	struct iphdr *packet_header;
	int len;
	char* payload;
};

#endif