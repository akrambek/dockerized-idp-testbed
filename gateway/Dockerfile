FROM kaazing/development-enterprise-gateway:develop-SNAPSHOT

RUN mkdir /build \
    && mv /kaazing-gateway /build/kaazing-gateway

WORKDIR /build/kaazing-gateway

ADD conf/* conf/
ADD lib/* lib/

ADD web/* web/

ENV PATH=$PATH:/build/kaazing-gateway/bin
