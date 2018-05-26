iptables -A INPUT -p tcp --dport 30006 --tcp-flags SYN SYN -j NFQUEUE --queue-num 80
iptables -A INPUT -p tcp --dport 30006 --tcp-flags ACK ACK -j NFQUEUE --queue-num 80
# iptables -A INPUT -p tcp --dport 80 --tcp-flags SYN SYN -j NFQUEUE --queue-num 80
# iptables -A INPUT -p tcp --dport 80 --tcp-flags ACK ACK -j NFQUEUE --queue-num 80
