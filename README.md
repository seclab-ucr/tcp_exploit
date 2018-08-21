# Off-Path TCP Exploit

We discover a subtle yet serious timing side channel that exists in all generations of IEEE 802.11 or Wi-Fi technology, due to the fact that they are half-duplex. By exploiting the vulnerability, we are able to constrcut reliable and practical off-path TCP injection attacks against the laterst versions of all three major operating systems (macOS, Windows, and Linux). Our attac only requires a devicce connected to the Internet via a wireless router, and be reachable from an attack server. The thread model is that a user is lured to visit a malicious website first and then the puppet (i.e., a malicious javascript) running in a browser collaborates with an off-path adversary to hijack a TCP connection between the client and server for the prupose of injecting a spurious HTTP response that will be cached in the browser. Later on, when the victim accesses to the server, the browser would load the cached object (e.g., a script) rather than request it again. Notice that the victim connection is established and preserved by the puppet who repeatedly includes HTML elements (e.g, images). See [web-cache poisoning atttacks](https://people.eecs.berkeley.edu/~yahel/papers/Browser-Cache-Poisoning.Song.Spring10.attack-project.pdf) for more background.

## Supported Platforms
Each branch is maintained for ONE OS. Currently, you're on the branch for Windows.

#### \*\*[Windows](https://github.com/seclab-ucr/tcp_exploit) (Current Branch)

[MacOS](https://github.com/seclab-ucr/tcp_exploit/tree/release_mac/)

## How to build
	1.1 sudo apt-get install libnetfilter-queue-dev

	1.2 cd tcp_exploit/server/src

	1.3 sh build.sh

## Notice

You have to adjust some IP addresses in the source code as follows: Change the IP address of the attacker's machine at line 242 in the file `tcp_exploit/client/index.html`.

The attack needs to know the exact size of the response to the request "http://www.cnn.com/SPECIALS/map.economy/images/jamie.smith.irpt.tn.jpg". However, the size varies on different machines due to HTTP headers embedded in the response. In the paper, we proposed a solution to automatically determine the size, yet I just manually set the correct value (retrieved from the developer tools in Chrome) to it by adding an option `-DSEQ_DELTA=1638` in the file `tcp_exploit/server/Makefile`. You can also use Wireshark to obtain such information.

During the attack's process, the TCP receive window size would grow as we keep requesting images. Based on the maximum window size that the client can achieve, you need to adjust the following at line 316 in the file `tcp_exploit/server/src/main.c`:
	`#define SEQ_WINDOW MAX_WINDOW_SIZE << 2`
where MAX_WINDOW_SIZE is the maximum window size representing the available space at the receiver's side.

## Set up environment
In order to set up the environment, we need one windows machine as the victim and one linux machine as the attacker. Our target website is `www.cnn.com`.

Network Topology:

    Attacker -------wire----------|
                               Router ---------wireless-------Victim (client)
    Server   -------wire----------|

On the attacker's machine, run the commands below:

	2.1 cd tcp_exploit/server

	2.2 sudo sh iptables.sh

	2.3 cd tcp_exploit/server/src

	2.4 sudo ./server

	2.5 cd tcp_exploit/client/src

	2.6 sudo python -m SimpleHTTPServer 80 (Alternatively, you can access to the malicious code (i.e., tcp_exploit/src/index.html) without setting up the HTTP server if you open the html file in browsers locally.)

## How to conduct experiment
	3.1 Launch Chrome and then access to the malicious website (http://attacker's IP address or file:///Path_to_the_dir/tcp_exploit/client/src/index.html)

	3.2 After the attack program finishes, you can access to the victim's website (i.e. www.cnn.com) to see whether the attack has successfully injected a page cached on the browser.

## Disclaimer
This is a reasearch-oriented project. Anyone using it should be aware of the potential risks and responsible for his/her own actions.

## Reference
```
@inproceedings{chen2018off,
  title={Off-Path TCP Exploit: How Wireless Routers Can Jeopardize Your Secrets},
  author={Chen, Weiteng and Qian, Zhiyun},
  booktitle={27th USENIX Security Symposium (USENIX Security 18)},
  year={2018},
  organization={USENIX Association}
}
```
