/* 
 * $smu-mark$ 
 * $name: sendtcp.c$ 
 * $author: Salvatore Sanfilippo <antirez@invece.org>$ 
 * $copyright: Copyright (C) 1999 by Salvatore Sanfilippo$ 
 * $license: This software is under GPL version 2 of license$ 
 * $date: Fri Nov  5 11:55:49 MET 1999$ 
 * $rev: 8$ 
 */ 

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>
#include <sys/time.h>
#include <unistd.h>
#include <signal.h>

#include "hping2.h"
#include "parse.h"

#define set_option(data, pos, kind, length) { \
	data[pos++] = kind; \
	data[pos++] = length; \
}

#ifdef ADDOPTIONS
static unsigned char* make_options(int &option_size, struct Options* opts) {
	unsigned char* options;
	static uint32_t heartbeat = 0;
	uint32_t echo, tstamp;
	int pos = 0;
	if (opts == NULL) {
		option_size = 0;
		return NULL;
	}

	option_size =  4 //Maximum segmen size
	             + 2 //TCP SACK Permitted
	             + 1 //No-operation
	             + 3 //Window scale(2^n)
	             + 10; //timestamp
	options = (unsigned char*)malloc(option_size);
	set_option(options, pos, 2, 4)
	*(unsigned short*)(options+pos) = 1386; //MSS
	pos += 2;
	set_option(options, pos, 4, 2) //SACK
	options[pos++] = 1; //NOP
	set_option(options, pos, 3, 3)
	options[pos++] = 0; //Scale
	set_option(options, pos, 8, 10) //timestamp
	echo = htonl(heartbeat++);
	memcpy(options+pos, &echo, 4); //timestamp
	pos += 4;
	tstamp = htonl(opts->tstamp);
	memcpy(options+pos, &tstamp, 4); //timestamp echo
	return options;
}
#endif

char* construct_tcp(int sport, int dport, const u_char *payload, int payload_size, 
	struct tcphdr_bsd* tcp_in, const char* srcIP, const char* dstIP, 
	struct Options* opts, int &packet_size) {
	int			tcp_opt_size = 0;
	char			*packet, *data;
//	struct mytcphdr		*tcp;
	struct pseudohdr	*pseudoheader;
#ifdef ADDOPTIONS
	unsigned char		*optlist;
	unsigned char       *options = make_options(tcp_opt_size, opts);
#endif

	packet_size = TCPHDR_SIZE + tcp_opt_size + payload_size;
	packet = (char*)malloc(PSEUDOHDR_SIZE + packet_size);
	if (packet == NULL) {
		perror("[send_tcphdr] malloc()");
		return NULL;
	}
	pseudoheader = (struct pseudohdr*) packet;
	struct mytcphdr* tcp =  (struct mytcphdr*) (packet+PSEUDOHDR_SIZE);
#ifdef ADDOPTIONS
	optlist = (unsigned char*) (packet+PSEUDOHDR_SIZE+TCPHDR_SIZE);
#endif
	data = (char*) (packet+PSEUDOHDR_SIZE+TCPHDR_SIZE+tcp_opt_size);
	
	memset(packet, 0, PSEUDOHDR_SIZE+packet_size);

    inet_pton(AF_INET, srcIP, &pseudoheader->saddr);
    inet_pton(AF_INET, dstIP, &pseudoheader->daddr);

	/* tcp pseudo header */
//	memcpy(&pseudoheader->saddr, &local.sin_addr.s_addr, 4);
//	memcpy(&pseudoheader->daddr, &remote.sin_addr.s_addr, 4);
	pseudoheader->protocol		= 6; /* tcp */
	pseudoheader->lenght		= htons(TCPHDR_SIZE+tcp_opt_size+payload_size);

	/* tcp header */
	tcp->th_dport	= htons(dport);
	tcp->th_sport	= htons(sport);

	/* sequence number and ack are random if not set */
	tcp->th_seq = htonl(tcp_in->th_seq);
	tcp->th_ack = htonl(tcp_in->th_ack);




	tcp->th_off	= (TCPHDR_SIZE + tcp_opt_size) >> 2 ;
	tcp->th_win	= htons(tcp_in->th_win);
	tcp->th_flags	= tcp_in->th_flags;

	/* data */
//	data_handler(data, payload, payload_size);
#ifdef ADDOPTIONS
	if (tcp_opt_size > 0) memcpy(optlist, options, tcp_opt_size);
#endif
    memcpy(data, payload, payload_size);

	/* compute checksum */
#ifdef STUPID_SOLARIS_CHECKSUM_BUG
	tcp->th_sum = packet_size;
#else
	tcp->th_sum = cksum((u_short*) packet, PSEUDOHDR_SIZE +
		      packet_size);
#endif

#ifdef ADDOPTIONS
	if (options) free(options);
#endif

	return packet+PSEUDOHDR_SIZE;
}

void release_tcp(char* tcp) {
	free(tcp - PSEUDOHDR_SIZE);
}

void send_tcp(int sport, int dport, int id, int ttl, const u_char *payload, int payload_size, 
	struct tcphdr_bsd* tcp_in, const char* srcIP, const char* dstIP, 
	struct Options* opts)
{
	int packet_size;
	char* packet = construct_tcp(sport, dport, payload, payload_size,
		tcp_in, srcIP, dstIP, opts, packet_size);

	/* adds this pkt in delaytable */
//	delaytable_add(sequence, src_port, time(NULL), get_usec(), S_SENT);

	/* send packet */
	send_ip_handler(0, ttl, (char*)srcIP, (char*)dstIP, packet, packet_size);
	release_tcp(packet);
}
