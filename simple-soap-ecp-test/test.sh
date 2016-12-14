#!/bin/bash

### Simple SOAP ECP Test

TEMPLATE=template.xml
NOW=$(date -u '+%FT%H:%M:%SZ')
ID=$(echo "${NOW}-$$" | shasum | cut -d ' ' -f 1)
ENTITYID=${ENTITYID:-https://sp.idptestbed/shibboleth}
ENDPOINT=${ENDPOINT:-https://idptestbed/Shibboleth.sso/SAML2/ECP}
URL=${URL:-https://idptestbed/idp/profile/SAML2/SOAP/ECP}

CRED=${CRED:-staff1:password}

ENDPOINT_ESCAPED="$(echo $ENDPOINT | sed -e 's/[\/&]/\\&/g')"
ENTITYID_ESCAPED="$(echo $ENTITYID | sed -e 's/[\/&]/\\&/g')"

REQUEST=$(cat $TEMPLATE |
	sed "s/__NOW__/$NOW/" |
	sed "s/__RANDOM_STRING__/$ID/" |
	sed "s/__REMOTE_ENTITYID__/$ENTITYID_ESCAPED/" |
	sed "s/__AssertionConsumerServiceURL__/$ENDPOINT_ESCAPED/")

echo $REQUEST | xmllint --pretty 1 -

echo $REQUEST |
	curl --trace-ascii trace.log -k \
		-d @- \
		-H "Content-Type: text/xml" \
		--basic -u $CRED \
		$URL 
