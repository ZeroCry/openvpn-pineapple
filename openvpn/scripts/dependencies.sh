#!/bin/sh
#2018 - Vay3t

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/sd/lib:/sd/usr/lib
export PATH=$PATH:/sd/usr/bin:/sd/usr/sbin

[[ -f /tmp/openvpn.progress ]] && {
  exit 0
}

touch /tmp/openvpn.progress

if [ "$1" = "install" ]; then
  if [ "$2" = "internal" ]; then
    opkg update
    opkg install openvpn-openssl
    opkg install liblzo
    
  elif [ "$2" = "sd" ]; then
    opkg update
    opkg install openvpn-openssl --dest sd
    opkg install liblzo --dest sd
  fi

  touch /etc/config/openvpn
  echo "config openvpn 'module'" > /etc/config/openvpn

  uci set openvpn.module.installed=1
  uci commit openvpn.module.installed

elif [ "$1" = "remove" ]; then
  opkg remove openvpn-openssl
	opkg remove liblzo

	rm -rf /etc/config/openvpn
fi

rm /tmp/openvpn.progress
