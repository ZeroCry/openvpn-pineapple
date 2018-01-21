#!/bin/sh

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/sd/lib:/sd/usr/lib
export PATH=$PATH:/sd/usr/bin:/sd/usr/sbin

MYTIME=`date +%s`

killall openvpn

if [ "$1" = "start" ]; then

	echo '1' > /proc/sys/net/ipv4/ip_forward
	iptables -X
	iptables -F
	iptables -t nat -F
	iptables -P INPUT ACCEPT
	iptables -P FORWARD ACCEPT
	iptables -P OUTPUT ACCEPT

	sh /pineapple/modules/openvpn/rules/iptables

	iptables -t nat -A POSTROUTING -j MASQUERADE

	openvpn /pineapple/modules/openvpn/files/client.ovpn --log /pineapple/modules/openvpn/log/output_${MYTIME}.log

elif [ "$1" = "stop" ]; then

	iptables -F
	iptables -X
	iptables -t nat -F
	iptables -t nat -X
	iptables -t mangle -F
	iptables -t mangle -X
	iptables -P INPUT ACCEPT
	iptables -P FORWARD ACCEPT
	iptables -P OUTPUT ACCEPT

fi

# sed -i "10iauth-user-pass pass.txt" /pineapple/modules/openvpn/files/client.ovpn