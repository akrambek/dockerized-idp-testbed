Simple SOAP ECP Test
====================

This simple script performs a test on a Basic Auth protected SAML2 ECP endpoint.

Based on original work from http://blogs.kent.ac.uk/unseenit/simple-shibboleth-ecp-test/

Usage
-----

Run below command

```
./test.sh
``` 

Troubleshooting
---------------

To troubleshoot the error one should look at the docker-compose IdP logs.

1. If the wrong time stamp is sent below error will be thrown.

```
idp_1          | 2016-12-13 19:27:35,581 - INFO [Shibboleth-Audit.SSO:241] - 20161213T192735Z|urn:oasis:names:tc:SAML:2.0:bindings:SOAP|_b2c92bc8216ff317a5c42d797a7cd8ca16|https://sp.idptestbed/shibboleth|http://shibboleth.net/ns/profiles/saml2/sso/ecp|https://idptestbed/idp/shibboleth||||||||
idp_1          | 2016-12-13 19:28:02,288 - WARN [org.opensaml.saml.common.binding.security.impl.MessageLifetimeSecurityHandler:152] - Message Handler:  Message was expired: message time was '2016-12-13T12:26:02.193Z', message expired at: '2016-12-13T12:32:02.193Z', current time: '2016-12-13T19:28:02.288Z'
idp_1          | 2016-12-13 19:28:02,307 - WARN [net.shibboleth.idp.profile.impl.WebFlowMessageHandlerAdaptor:202] - Profile Action WebFlowMessageHandlerAdaptor: Exception handling message
idp_1          | org.opensaml.messaging.handler.MessageHandlerException: Message was rejected due to issue instant expiration
idp_1          | 	at org.opensaml.saml.common.binding.security.impl.MessageLifetimeSecurityHandler.doInvoke(MessageLifetimeSecurityHandler.java:155)
idp_1          | 2016-12-13 19:28:02,322 - WARN [org.opensaml.profile.action.impl.LogEvent:105] - A non-proceed event occurred while processing the request: MessageExpired
```

To fix the issue you just need to change then `IssueInstant` to for example `2016-12-13T12:32:02.193Z`

2. If the duplicated ID is sent below error will be thrown on the docker-compose IdP logs 

```
idp_1          | 2016-12-13 18:58:45,365 - INFO [Shibboleth-Audit.SSO:241] - 20161213T185845Z||||http://shibboleth.net/ns/profiles/saml2/sso/ecp|||||||||
idp_1          | 2016-12-13 18:59:12,946 - WARN [org.opensaml.saml.common.binding.security.impl.MessageReplaySecurityHandler:156] - Message Handler:  Replay detected of message '_96f00291f71ed87ce7a4f2d94edd04101' from issuer 'https://sp.idptestbed/shibboleth'
idp_1          | 2016-12-13 18:59:12,953 - WARN [net.shibboleth.idp.profile.impl.WebFlowMessageHandlerAdaptor:202] - Profile Action WebFlowMessageHandlerAdaptor: Exception handling message
idp_1          | org.opensaml.messaging.handler.MessageHandlerException: Rejecting replayed message ID '_96f00291f71ed87ce7a4f2d94edd04101' from issuer https://sp.idptestbed/shibboleth
idp_1          | 	at org.opensaml.saml.common.binding.security.impl.MessageReplaySecurityHandler.doInvoke(MessageReplaySecurityHandler.java:157
``` 

