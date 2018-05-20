#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <stdint.h>

#include "parse.h"
#include "packet.h"
#include "hping2.h"

static uint32_t get_tcp_timestamp(Packet *packet, struct tcphdr* tcp, unsigned int tcp_len) {
    int optlen;
    unsigned char *opt;
    uint32_t tstamp, echo;
    unsigned int tcphdrlen;

    if (tcp_len < TCPHDR_SIZE)
        return 0;
    tcphdrlen = tcp->th_off * 4;
    /* bad len or no options in the TCP header */
    if (tcphdrlen <= 20 || tcphdrlen > tcp_len)
        return 0;
    optlen = tcphdrlen - TCPHDR_SIZE;
    opt = (unsigned char*)tcp + TCPHDR_SIZE;

    while (optlen) {
        switch(*opt) {
            case 0: //end of option
                return 0;
            case 1: //nop
                opt++;
                optlen--;
                continue;
            default:
                if (optlen < 2)
                    return 0;
                if (opt[1] > optlen)
                    return 0;
                if (opt[0] != 8) {
                    optlen -= opt[1];
                    opt += opt[1];
                    continue;
                }
                if (opt[1] != 10) /*bad len*/
                    return 0;
                memcpy(&tstamp, opt+2, 4);
                memcpy(&echo, opt+6, 4);
                tstamp = ntohl(tstamp);
                echo = ntohl(echo);
                if (packet) {
                    packet->tstamp = tstamp;
                    packet->echo = echo;
                }
                return tstamp;
        }
    }
    return 0;
}

uint32_t get_timestamp(struct iphdr* packet_header, unsigned char* payload, int len) {
    struct tcphdr* packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
    int tcp_len = len - packet_header->ihl * 4;
    return get_tcp_timestamp(NULL, packet_tcp_header, tcp_len);
}

uint16_t get_dport(struct iphdr* packet_header, unsigned char* payload, int len) {
    struct tcphdr* packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
    return ntohs(packet_tcp_header->th_dport);
}

int get_ip(struct iphdr* packet_header, unsigned char* payload, 
    int len, Packet *packet) {
    inet_ntop(AF_INET, &packet_header->saddr, packet->sip,
            INET_ADDRSTRLEN);
    inet_ntop(AF_INET, &packet_header->daddr, packet->dip,
            INET_ADDRSTRLEN);
    return 1;
}

uint32_t get_ack(struct iphdr* packet_header, unsigned char* payload, int len) {
    struct tcphdr* packet_tcp_header;

    if (packet_header->protocol == IP_PROTOCOL_TCP) {
        packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
        // get ack
        return ntohl(packet_tcp_header->th_ack);
    }
    return -1;
}

uint32_t get_seq(struct iphdr* packet_header, unsigned char* payload, int len) {
    struct tcphdr* packet_tcp_header;

    if (packet_header->protocol == IP_PROTOCOL_TCP) {
        packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
        // get ack
        return ntohl(packet_tcp_header->th_seq);
    }
    return -1;
}

int parse_ip_packet(struct iphdr* packet_header, unsigned char* payload, 
    int len, Packet* packet, bool new_data) {

    struct tcphdr* packet_tcp_header;
    char* tcp_payload = NULL;
    int tcp_len;

    inet_ntop(AF_INET, &packet_header->saddr, packet->sip,
            INET_ADDRSTRLEN);
    inet_ntop(AF_INET, &packet_header->daddr, packet->dip,
            INET_ADDRSTRLEN);

    if (packet_header->protocol == IP_PROTOCOL_TCP) {
        packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
        tcp_payload = (char*)payload + (packet_header->ihl * 4);
        tcp_len = len - packet_header->ihl * 4;
        // get port
        packet->sport = ntohs(packet_tcp_header->th_sport);
        if (packet->sport < 10000) {
            printf("errors\n");
            printf("header len: %d\n", packet_header->ihl);
            exit(1);
        }
        packet->dport = ntohs(packet_tcp_header->th_dport);
        packet->seq = ntohl(packet_tcp_header->th_seq);
        packet->ack = ntohl(packet_tcp_header->th_ack);
        packet->size = tcp_len - packet_tcp_header->th_off * 4;
        if (new_data) {
            packet->payload = (char *)malloc(packet->size);
            strncpy(packet->payload, tcp_payload + packet_tcp_header->th_off * 4, packet->size);
        } else {
            packet->payload = tcp_payload + packet_tcp_header->th_off * 4;
        }
        get_tcp_timestamp(packet, packet_tcp_header, tcp_len);
        return packet->size;
    }
    return -1;
}

char* retrieve_text_payload(struct iphdr* packet_header, unsigned char* payload, int len) {
	struct tcphdr* packet_tcp_header;
    char* tcp_payload = NULL;
    int tcp_len = 0;
	if (packet_header->protocol == IP_PROTOCOL_TCP) {
		packet_tcp_header = (struct tcphdr*)(payload + (packet_header->ihl * 4));
		tcp_len = len - packet_header->ihl * 4 - packet_tcp_header->th_off * 4;
		tcp_payload = (char*)malloc(tcp_len+1);
		strncpy(tcp_payload, (char*)payload + (packet_header->ihl * 4), tcp_len);
		tcp_payload[tcp_len] = '\0';
	}
	return tcp_payload;
}
