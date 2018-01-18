#!/bin/sh
#2018 - Vay3t

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/sd/lib:/sd/usr/lib
export PATH=$PATH:/sd/usr/bin:/sd/usr/sbin

MYTIME=`date +%s`
MYCMD=`cat /tmp/openvpn.run`

if [ "$1" = "start" ]; then
	eval ${MYCMD}
	rm -rf /tmp/openvpn.run
elif [ "$1" = "stop" ]; then
  killall openvpn-openssl
	rm -rf /tmp/openvpn.run
fi