function setupSSO(webSocketFactory) {

	var endcodeOrDecodeString = function (type, string) {

		// Create Base64 Object
		var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

		var returnString = "";

		if (type == "encode") {
			returnString = Base64.encode(string);
		} else if (type == "decode") {
			returnString = Base64.decode(string);
		} else {
			returnString = "";
		}
		return returnString;
	}

	var getToken = function (samlToken) {
		var xmlResponse = "";
		$.ajax({
			type: "POST",
			url: "https://idptestbed/idp/profile/SAML2/SOAP/ECP",
			data: "<?xml version=\"1.0\" encoding=\"UTF-8\"?><soap11:Envelope xmlns:soap11=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><samlp:AuthnRequest  xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" AssertionConsumerServiceURL=\"https://idptestbed/Shibboleth.sso/SAML2/ECP\" ID=\"c2f49e0e7eaa3e01cb2f8634f04f5b85354d314a\" IssueInstant=\"2016-12-14T17:47:34Z\" ProtocolBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:PAOS\" Version=\"2.0\"><saml:Issuer xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\">https://sp.idptestbed/shibboleth</saml:Issuer></samlp:AuthnRequest></S:Body></soap11:Envelope>",
			contentType: "text/xml",
			async: false,
			headers: {
				"Authorization": "Basic " + btoa("staff1:password")
			},
			dataType: "xml",
			cache: false,
			error: function (data) { 
				console.log("No data found."); 
				xmlResponse = data.responseText;
			},
			success: function (data) {
				console.log(data);
				xmlResponse =data.responseText;
			}
		});
		return xmlResponse
	}

	var samlChallengeHander = function () {

		this.canHandle = function (challengeRequest) {
			// Return true if challengeRequest.authenticationScheme matches your scheme.
			return challengeRequest != null && "token" == challengeRequest.authenticationScheme.trim().toLowerCase();
		}
		this.handle = function (challengeRequest, callback) {
			var challengeResponse = null;
			if (challengeRequest.location != null) {
				var token = ""; getToken(challengeRequest.authenticationParameters); 
				token = endcodeOrDecodeString("encode", token);
				if (token != null) {
					// Set the token to challengeResponse
					challengeResponse = new ChallengeResponse("Token " + token, null);
				}
			}
			// Invoke callback function with challenge response
			callback(challengeResponse);
		}
	}
	
	webSocketFactory.setChallengeHandler(new samlChallengeHander());
}

function popupLoginDialog(callback) {

	//popup dialog to get credentials
	var popup = document.getElementById("logindiv");
	$("#logindiv").slideToggle(300);
	var login = document.getElementById("login");
	var cancel = document.getElementById("cancel");

	$('#username').focus();

	// As a convenience, connect when the user presses Enter
	// in the location field.
	$('#password').keypress(function (e) {
		if (e.keyCode == 13) {
			e.stopImmediatePropagation(); // Prevent firing twice.
			login.click();
		}
	});

	//"OK" button was clicked, invoke callback function with credential to login
	login.onclick = function () {
		var username = document.getElementById("username");
		var password = document.getElementById("password");
		var credentials = new PasswordAuthentication(username.value, password.value);
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		$("#logindiv").slideToggle(100);
		callback(credentials);
	}

	//"Cancel" button has been clicked, invoke callback function with null argument to cancel login
	cancel.onclick = function () {
		var username = document.getElementById("username");
		var password = document.getElementById("password");
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		$("#logindiv").slideToggle(100);
		callback(null);
	}
}

function setup() {

	var locationURI = new URI("wss://gateway.kaazing.test:9000/echo	");
	var websocket;

	var consoleLog = document.getElementById("consoleLog");
	var clear = document.getElementById("clear");
	var wsurl = document.getElementById("wsurl");
	var message = document.getElementById("message");
	var connect = document.getElementById("connect");
	var sendText = document.getElementById("sendText");
	var sendBlob = document.getElementById("sendBlob");
	var sendArrayBuffer = document.getElementById("sendArrayBuffer");
	var sendByteBuffer = document.getElementById("sendByteBuffer");
	var close = document.getElementById("close");

	// Enable or disable controls based on whether or not we are connected.
	// For example, disable the Connect button if we're connected.
	var setFormState = function (connected) {
		wsurl.disabled = connected;
		connect.disabled = connected;
		close.disabled = !connected;
		message.disabled = !connected;
		sendText.disabled = !connected;
		sendBlob.disabled = !connected;
		sendArrayBuffer.disabled = !connected || (typeof (Uint8Array) === "undefined");
		sendByteBuffer.disabled = !connected;
	}

	// As a convenience, connect when the user presses Enter
	// if no fields have focus, and we're not currently connected.
	$(window).keypress(function (e) {
		if (e.keyCode == 13) {
			if (e.target.nodeName == "BODY" && wsurl.disabled == false) {
				doConnect();
			}
		}
	});

	// As a convenience, connect when the user presses Enter
	// in the location field.
	$('#wsurl').keypress(function (e) {
		if (e.keyCode == 13) {
			doConnect();
		}
	});

	// As a convenience, send as text when the user presses Enter
	// in the message field.
	$('#message').keypress(function (e) {
		if (e.keyCode == 13) {
			doSendText();
		}
	});

	wsurl.value = locationURI.toString();
	setFormState(false);
	var log = function (message) {
		var pre = document.createElement("pre");
		pre.style.wordWrap = "break-word";
		pre.innerHTML = message;
		consoleLog.appendChild(pre);
		consoleLog.scrollTop = consoleLog.scrollHeight;
		while (consoleLog.childNodes.length > 25) {
			consoleLog.removeChild(consoleLog.firstChild);
		}
	};

	var logResponse = function (message) {
		log("<span style='color:blue'>" + message + "</span>");
	}

	// Takes a string and Returns an array of bytes decoded as UTF8
	var getBytes = function (str) {
		var buf = new ByteBuffer();
		Charset.UTF8.encode(str, buf);
		buf.flip();
		return buf.array;
	}

	var doSendText = function () {
		try {
			var text = message.value;
			log("SEND TEXT: " + text);
			websocket.send(text);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	};

	sendText.onclick = doSendText;

	sendBlob.onclick = function () {
		try {
			// BlobUtils is implemented for all supported platforms
			var blob = BlobUtils.fromString(message.value, "transparent");
			log("SEND BLOB: " + blob);
			websocket.binaryType = "blob";
			websocket.send(blob);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	sendArrayBuffer.onclick = function () {
		try {
			// ArrayBuffer is only supported on modern browsers
			var bytes = getBytes(message.value);
			var array = new Uint8Array(bytes);
			log("SEND ARRAY BUFFER: " + array.buffer);
			websocket.binaryType = "arraybuffer";
			websocket.send(array.buffer);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	sendByteBuffer.onclick = function () {
		try {
			// Convert ByteBuffer to
			var buf = new ByteBuffer();
			buf.putString(message.value, Charset.UTF8);
			buf.flip();

			log("SEND BYTE BUFFER: " + buf);
			websocket.binaryType = "bytebuffer";
			websocket.send(buf);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	var doConnect = function () {
		log("CONNECT: " + wsurl.value);
		connect.disabled = true;
		try {
			var factory = new WebSocketFactory();
			setupSSO(factory);
			websocket = factory.createWebSocket(wsurl.value);

			websocket.onopen = function (evt) {
				log("CONNECTED");
				setFormState(true);
				message.focus();
			}

			websocket.onmessage = function (evt) {
				var data = evt.data;
				if (typeof (data) == "string") {
					//text
					logResponse("RECEIVED TEXT: " + data);
				}
				else if (data.constructor == ByteBuffer) {
					//bytebuffer
					logResponse("RECEIVED BYTE BUFFER: " + data);
				}
				else if (data.byteLength) {
					//arraybuffer
					var u = new Uint8Array(data);
					var bytes = [];
					for (var i = 0; i < u.byteLength; i++) {
						bytes.push(u[i]);
					}
					logResponse("RECEIVED ARRAY BUFFER: " + bytes);
				}
				else if (data.size) {
					//blob
					var cb = function (result) {
						logResponse("RECEIVED BLOB: " + result);
					};
					BlobUtils.asNumberArray(cb, data);
				}
				else {
					logResponse("RECEIVED UNKNOWN TYPE: " + data);
				}
			}

			websocket.onclose = function (evt) {
				log("CLOSED: (" + evt.code + ") " + evt.reason);
				setFormState(false);
			}

		}
		catch (e) {
			connect.disabled = false;
			log("EXCEPTION: " + e);
			setFormState(true);
		}
	};

	connect.onclick = doConnect;

	close.onclick = function () {
		log("CLOSE");
		websocket.close();
	};

	clear.onclick = function () {
		while (consoleLog.childNodes.length > 0) {
			consoleLog.removeChild(consoleLog.lastChild);
		}
	};
}
$(document).ready(function () {
	setup();
});
