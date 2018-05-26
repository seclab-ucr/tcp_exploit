#include <errno.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "hping2.h"

/* globals */
unsigned int
tcp_th_flags = 0, 
             linkhdr_size,               /* physical layer header size */
             ip_tos = 0,
             set_seqnum = FALSE,
             tcp_seqnum = FALSE,
             set_ack,    
             h_if_mtu,
             virtual_mtu = DEFAULT_VIRTUAL_MTU,
             ip_frag_offset  = 0,
             signlen,
             lsr_length = 0, 
             ssr_length = 0, 
             tcp_ack;


unsigned short int
data_size = 0;

float
rtt_min = 0,
        rtt_max = 0,
        rtt_avg = 0;

int
sockpacket,
    sockraw,
    sent_pkt = 0,
    recv_pkt = 0,
    out_of_sequence_pkt = 0,
    sending_wait = DEFAULT_SENDINGWAIT, /* see DEFAULT_SENDINGWAIT */
    opt_rawipmode   = FALSE,
    opt_icmpmode    = FALSE,
    opt_udpmode = FALSE,
    opt_scanmode    = FALSE,
    opt_listenmode  = FALSE,
    opt_waitinusec  = FALSE,
    opt_numeric = FALSE,
    opt_gethost = TRUE,
    opt_quiet   = FALSE,
    opt_relid   = FALSE,
    opt_fragment    = FALSE,
    opt_df      = FALSE,
    opt_mf      = FALSE,
    opt_debug   = FALSE,
    opt_verbose = FALSE,
    opt_winid_order = FALSE,
    opt_keepstill   = FALSE,
    opt_datafromfile= FALSE,
    opt_hexdump = FALSE,
    opt_contdump    = FALSE,
    opt_sign    = FALSE,
    opt_safe    = FALSE,
    opt_end     = FALSE,
    opt_traceroute  = FALSE,
    opt_seqnum  = FALSE,
    opt_incdport    = FALSE,
    opt_force_incdport = FALSE,
    opt_icmptype    = DEFAULT_ICMP_TYPE,
    opt_icmpcode    = DEFAULT_ICMP_CODE,
    opt_rroute  = FALSE,
    opt_tcpexitcode = FALSE,
    opt_badcksum    = FALSE,
    opt_tr_keep_ttl = FALSE,
    opt_tcp_timestamp = FALSE,
    opt_tr_stop = FALSE,
    opt_tr_no_rtt   = FALSE,
    opt_rand_dest   = FALSE,
    opt_rand_source = FALSE,
    opt_lsrr        = FALSE,
    opt_ssrr        = FALSE,
    opt_cplt_rte    = FALSE,
    tcp_exitcode    = 0,
    src_ttl     = DEFAULT_TTL,
    src_id      = -1, /* random */
    base_dst_port   = DEFAULT_DPORT,
    dst_port    = DEFAULT_DPORT,
    src_port,
    sequence    = 0,
    initsport   = DEFAULT_INITSPORT,
    src_winsize = DEFAULT_SRCWINSIZE,
    src_thoff   = (TCPHDR_SIZE >> 2),
    count       = DEFAULT_COUNT,
    ctrlzbind   = DEFAULT_BIND,
    delaytable_index= 0,
    eof_reached = FALSE,
    icmp_ip_version = DEFAULT_ICMP_IP_VERSION,
    icmp_ip_ihl = DEFAULT_ICMP_IP_IHL,
    icmp_ip_tos = DEFAULT_ICMP_IP_TOS,
    icmp_ip_tot_len = DEFAULT_ICMP_IP_TOT_LEN,
    icmp_ip_id  = DEFAULT_ICMP_IP_ID,
    icmp_ip_protocol= DEFAULT_ICMP_IP_PROTOCOL,
    icmp_ip_srcport = DEFAULT_DPORT,
    icmp_ip_dstport = DEFAULT_DPORT,
    opt_force_icmp  = FALSE,
    icmp_cksum  = DEFAULT_ICMP_CKSUM,
    raw_ip_protocol = DEFAULT_RAW_IP_PROTOCOL;

/*
 *  * from R. Stevens's Network Programming
 *   */
__u16 cksum(__u16 *buf, int nbytes)
{
    __u32 sum;
    __u16 oddbyte;

    sum = 0;
    while (nbytes > 1) {
        sum += *buf++;
        nbytes -= 2;
    }

    if (nbytes == 1) {
        oddbyte = 0;
        *((__u16 *) &oddbyte) = *(__u16 *) buf;
        sum += (oddbyte & 0xff);
    }

    sum = (sum >> 16) + (sum & 0xffff);
    sum += (sum >> 16);

    /* return a bad checksum with --badcksum
     * option */
//    if (opt_badcksum) sum ^= 0x5555;

    return (__u16) ~sum;
}


void data_handler(char *data, int data_size)
{
    if (data_size == 0)
        return; /* there is not space left */

    memset(data, 'X', data_size);
}




void send_ip_handler(int type, int ttl, char* srcIP, char* dstIP, char *packet, unsigned int size)
{
    unsigned char ip_optlen = 0;
    char* ip_opt = NULL;

    unsigned short fragment_flag = 0;

    send_ip(type, ttl, srcIP,
            dstIP,
            packet, size, fragment_flag, ip_frag_offset,
            ip_opt, ip_optlen);
}

// type 0 TCP
// type 1 UDP
// type 2 ICMP
void send_ip (int type, int ttl, char* src, char *dst, char *data, unsigned int datalen,
        int more_fragments, unsigned short fragoff, char *options,
        char optlen)
{
    char        *packet;
    int     result,
            packetsize;
    struct myiphdr  *ip;

    packetsize = IPHDR_SIZE + optlen + datalen;
    if ( (packet = (char*)malloc(packetsize)) == NULL) {
        perror("[send_ip] malloc()");
        return;
    }

    memset(packet, 0, packetsize);
    ip = (struct myiphdr*) packet;

    struct sockaddr_in srcAddr;
    struct sockaddr_in dstAddr;
    srcAddr.sin_family = AF_INET;
    dstAddr.sin_family = AF_INET;
    // store this IP address in struct sockaddr_in:
    inet_pton(AF_INET, src, &(srcAddr.sin_addr));
    inet_pton(AF_INET, dst, &(dstAddr.sin_addr));

    /* copy src and dst address */
    memcpy(&ip->saddr, (char*)&srcAddr.sin_addr, sizeof(ip->saddr));
    memcpy(&ip->daddr, (char*)&dstAddr.sin_addr, sizeof(ip->daddr));
    
//    memcpy(&ip->saddr, src, sizeof(ip->saddr));
//    memcpy(&ip->daddr, dst, sizeof(ip->daddr));

    /* build ip header */
    ip->version = 4;
    ip->ihl     = (IPHDR_SIZE + optlen + 3) >> 2;
    ip->tos     = ip_tos;

#if defined OSTYPE_FREEBSD || defined OSTYPE_NETBSD || defined OSTYPE_BSDI
    /* FreeBSD */
    /* NetBSD */
    ip->tot_len = packetsize;
#else
    /* Linux */
    /* OpenBSD */
    ip->tot_len = htons(packetsize);
#endif

    if (!opt_fragment)
    {
        ip->id      = (src_id == -1) ?
            htons((unsigned short) rand()) :
            htons((unsigned short) src_id);
    }
    else /* if you need fragmentation id must not be randomic */
    {
        /* FIXME: when frag. enabled sendip_handler
         * shold inc. ip->id */
        /*        for every frame sent */
        ip->id      = (src_id == -1) ?
            htons(getpid() & 255) :
            htons((unsigned short) src_id);
    }

#if defined OSTYPE_FREEBSD || defined OSTYPE_NETBSD | defined OSTYPE_BSDI
    /* FreeBSD */
    /* NetBSD */
    ip->frag_off    |= more_fragments;
    ip->frag_off    |= fragoff >> 3;
#else
    /* Linux */
    /* OpenBSD */
    ip->frag_off    |= htons(more_fragments);
    ip->frag_off    |= htons(fragoff >> 3); /* shift three flags bit */
#endif

    ip->ttl     = ttl;
    if (type == 2)  ip->protocol = 1;   /* icmp */
    else if (type == 1)   ip->protocol = 17;  /* udp  */
    else if (type == 0)           ip->protocol = 6;   /* tcp  */
    ip->check   = 0; /* always computed by the kernel */

    /* copies options */
    if (options != NULL)
        memcpy(packet+IPHDR_SIZE, options, optlen);

    /* copies data */
    memcpy(packet + IPHDR_SIZE + optlen, data, datalen);




    result = sendto(sockraw, packet, packetsize, 0,
            (struct sockaddr*)&dstAddr, sizeof(struct sockaddr));

    if (result == -1 && errno != EINTR && !opt_rand_dest && !opt_rand_source) {
        perror("[send_ip] sendto");
        if (close(sockraw) == -1)
            perror("[ipsender] close(sockraw)");
#if (!defined OSTYPE_LINUX) || (defined FORCE_LIBPCAP)
//        if (close_pcap() == -1)
//            printf("[ipsender] close_pcap failed\n");
#else
        if (close_sockpacket(sockpacket) == -1)
            perror("[ipsender] close(sockpacket)");
#endif /* ! OSTYPE_LINUX || FORCE_LIBPCAP */
        exit(1);
    }
//    printf("success\n");

    free(packet);

    /* inc packet id for safe protocol */
    if (opt_safe && !eof_reached)
        src_id++;
}



int open_sockraw()
{
    int s;
    int optval = 1;

    s = socket(AF_INET, SOCK_RAW, IPPROTO_RAW);
    setsockopt(s, IPPROTO_TCP, TCP_NODELAY, &optval, sizeof optval);
    if (s == -1) {
        perror("[open_sockraw] socket()");
        return -1;
    }

    return s;
}





static void enlarge_recvbuf(int fd)
{
    int val = 131070;
    int len = sizeof(val);

    /* Don't check the error: non fatal */
    setsockopt(fd, SOL_SOCKET, SO_RCVBUF, (const char *) &val, len);
}

int open_sockpacket(int portno)
{
    int s;

    if (opt_debug)
        printf("DEBUG: Trying to open PF_PACKET socket... ");

//    s = socket(PF_PACKET, SOCK_RAW, htons(ETH_P_IP));
#define ETH_P_ALL 0x0003
//	s = socket(PF_PACKET, SOCK_PACKET, htons(ETH_P_ALL));
    s = socket(PF_INET, SOCK_RAW, IPPROTO_TCP);
    int tmp = 1;
    const int *val = &tmp;
    setsockopt (s, IPPROTO_IP, IP_HDRINCL, val, sizeof (tmp));



    if (s == -1) {
        if (opt_debug) {
            printf("DEBUG: failed ( 2.0.x kernel? )\n");
            printf("DEBUG: Trying to open SOCK_PACKET socket... ");
        }
        s = socket(AF_INET, SOCK_PACKET, htons(ETH_P_IP));
    }

    if (s == -1) {
        perror("[open_sockpacket] socket()");
        return -1;
    }
    enlarge_recvbuf(s);

    struct sockaddr_in serv_addr;
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = INADDR_ANY;
    serv_addr.sin_port = htons(portno);
/*    if (bind(s, (struct sockaddr *) &serv_addr,
                sizeof(serv_addr)) < 0)
    {
        perror("ERROR on binding");
    }
*/

    if (opt_debug)
        printf("DEBUG: PF_PACKET, SOCK_RAW open OK\n");

    return s;
}

int close_sockpacket(int s)
{
    return close(s);
}

