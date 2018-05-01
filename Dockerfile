FROM node:slim

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install avahi-daemon avahi-discover g++ git libavahi-compat-libdnssd-dev libnss-mdns make python python-dev python-pip

RUN npm install -g --unsafe-perm homebridge

RUN pip install flux_led

RUN mkdir ~/.homebridge

WORKDIR /root

ENTRYPOINT service dbus start && service avahi-daemon start && bash
