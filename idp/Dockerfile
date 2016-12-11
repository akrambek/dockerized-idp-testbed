# FROM dockerizedidptestbedakram_idp:latest
FROM unicon/shibboleth-idp:latest

MAINTAINER Unicon, Inc.

COPY shibboleth-idp/ /opt/shibboleth-idp/

COPY jetty/etc/jetty.xml /opt/jetty-home/etc/
COPY jetty-base/webapps/idp.xml /opt/shib-jetty-base/webapps/
COPY jetty-base/start.d/jaas.ini /opt/shib-jetty-base/start.d/
COPY jetty-base/start.ini /opt/shib-jetty-base/
