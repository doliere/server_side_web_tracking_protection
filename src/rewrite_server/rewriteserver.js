var https = require('https');
var http = require('http');
var fs = require('fs');
const purl = require('url');
const request = require('request');
const rewrite = require('./rewrite');
const config = require('./config.json');
const dotnotrewrite = require('./dotnotrewrite.json');

	//Can provide those as parameters when starting the 
const originalServerPort = config.originalServerNewPort;
const originalServerHost = config.originalServerHost;
const rewriteProxyPort = config.rewriteServerHttpPort;
const rewriteProxyPortS = config.rewriteServerHttpsPort;

var defaultProtocol = "http:";
  //Listen to HTTPS connections ?
if(config.rewriteServerHttpsPort){
  defaultProtocol = "https:";
  soptions = {
    key: fs.readFileSync(config.https_key),
    cert: fs.readFileSync(config.https_cert),
  }
  httpsServer = https.createServer(soptions, makeRequest).listen(rewriteProxyPortS);
}

  //Listen to HTTP Connections ?
if(config.rewriteServerHttpPort){
  httpServer = http.createServer(makeRequest).listen(config.rewriteServerPort);
}

  //WebSockets
if(config.rewriteServerHttpPort){
  WebSocketServer = require('websocket').server;

  wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
  });

  wsServer.on('request', function(request) {
      transfer(request);
  });
}
  //Secure web sockets connections
if(config.rewriteServerHttpsPort){
  WebSocketClient = require('websocket').client;

  wssServer = new WebSocketServer({
      httpServer: httpsServer,
      autoAcceptConnections: false
  });

  wssServer.on('request', function(request) {
      transfer(request);
  });
}


function prependToAFile(ofile, nfile, content){
  var data = fs.readFileSync(ofile).toString().split("\n");
  data.splice(0, 0, content);
  var text = data.join("\n");
  fs.writeFile(nfile, text, function (err) {
    if (err) return err;
  });
}

  //Generate the script used 
var ndynamicContentRewriter = "generated_dynamic.js";
var pcontent = 'var rwuh ="' + config.middleServerURL + '";';
var dnr = 'var donotrewrite = ' + JSON.stringify(donotrewrite);
pcontent = pcontent + "\n" + dnr;
prependToAFile(config.dynamicContentRewriter, ndynamicContentRewriter, pcontent);
function getHost( hostString ) {
  var regex_hostport = /^([^:]+)(:([0-9]+))?$/;
  var host = hostString;

  var result = regex_hostport.exec( hostString );
  if ( result != null ) {
    host = result[1];
  }

  return host;
}

function getBaseURL(protocol){
  return protocol + "//" + originalServerHost;
}

function handleOriginalServerHeaders(respHeaders, uRequest){
  var rh = respHeaders;
  //if(((respHeaders["content-type"] && respHeaders["content-type"].toLowerCase().indexOf("text/html") >=0) || (uRequest.headers["accept"] && uRequest.headers["accept"].toLowerCase().indexOf("text/html")>=0))){
  if(((respHeaders["content-type"] && respHeaders["content-type"].toLowerCase().indexOf("text/html") >=0) )) {
   rh["Content-Security-Policy"] = rewrite.getCSP();
  }
  delete rh["content-length"];
  return rh;
}
  
  //Handle Server Response
function handleOriginalServerResponse(sResponse, uResponse, url, uRequest){
  if((sResponse.headers["content-type"]) || uRequest.headers["accept"]){
    if((sResponse.headers["content-type"] && sResponse.headers["content-type"].toLowerCase().indexOf("text/html") >=0) ) {
      rewrite.rewriteContent(sResponse, url, "html", uResponse);
    }else if((sResponse.headers["content-type"] && sResponse.headers["content-type"].toLowerCase().indexOf("text/css") >=0) || (uRequest.headers["accept"] && uRequest.headers["accept"].toLowerCase().indexOf("text/css")>=0)){
      rewrite.rewriteContent(sResponse, url, "css", uResponse);
    }else{
      sResponse.pipe(uResponse);
    }
  }else{
    sResponse.pipe(uResponse);
  }
}




// handle a HTTP proxy request
function makeRequest( userRequest, userResponse ) {
	if(userRequest.url == config.dynamicContentRewriter){
		userResponse.writeHead(200, {"Content-Type": "application/javascript"});
		fs.createReadStream("." + ndynamicContentRewriter).pipe(userResponse);
	}else{
	  var host = getHost( userRequest.headers['host'] );
	  var mheaders = userRequest.headers;
	  delete mheaders["host"];

	  var options = {
	    'host': host,
	    'port': originalServerPort,
	    'method': userRequest.method,
	    'path': userRequest.url,
	    'agent': userRequest.agent,
	    'auth': userRequest.auth,
	    'headers': mheaders
	  };

	  var proxyRequest = http.request(options);

	  proxyRequest.on(
	    'error',
	    function ( error ) {
	      userResponse.writeHead( 500 );
	      userResponse.end("");
	    }
	  );

	  proxyRequest.on('response', function(sResponse){
	    userResponse.writeHead(
	      sResponse.statusCode,
	      sResponse.statusMessage,
	      handleOriginalServerHeaders(sResponse.headers, userRequest)
	    );

	    handleOriginalServerResponse(sResponse, userResponse, getBaseURL(defaultProtocol), userRequest);
    });

	  userRequest.addListener(
	    'data',
	    function (chunk) {
	      proxyRequest.write( chunk );
	    }
	  );

	  userRequest.addListener(
	    'end',
	    function () {
	      proxyRequest.end();
	    }
	  );
	}
}


  //Sockets Forwarding
function transfer(request){
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        //console.log('Connection to remote host failed ' + error.toString());
        request.reject();
    });

    client.on('connect', function(remoteconn) {

            //Once connected with a remote host, notify the user...
        var usercon = request.accept(remoteconn.protocol, request.origin);

        remoteconn.on('error', function(error) {
            //console.log("Connection Error: " + error.toString());
        });

        remoteconn.on('close', function() {
            usercon.close();
        });

        remoteconn.on('message', function(message) {
            if (message.type === 'utf8') {
                //console.log('Received Message from third party ');
                usercon.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                //console.log('Received Binary Message of from third party ');
                usercon.sendBytes(message.binaryData);
            }
        });

        usercon.on('message', function(message) {
            if (message.type === 'utf8') {
                //console.log('Received message from user ');
                remoteconn.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                //console.log('Received bm from user' + message.binaryData.length + ' bytes');
                remoteconn.sendBytes(message.binaryData);
            }
        });

        usercon.on('close', function(){
            remoteconn.close();
        });
    });

    var headers = request.httpRequest.headers;
    delete headers["host"];
    delete headers["cookie"];

  var surl = purl.parse(request.resourceURL.href, true); 
  var type = surl.query.type; 
  var rurl = surl.query.ru || surl.query["amp;ru"] || "";
  var ssurl = surl.query.su || surl.query["am;su"] || "";
  rurl = Buffer.from(rurl, 'base64').toString();
  ssurl = Buffer.from(ssurl, "base64").toString();
  client.connect(rurl, request.requestedProtocols, request.origin, headers);
}
