var https = require('https');
var http = require('http');
var fs = require('fs');
const purl = require('url');
const rewrite = require('./rewrite');
var request = require('request');
const config = require('./config.json');


function getHostPortFromString( hostString, defaultPort ) {
  var host = hostString;
  var port = defaultPort;
  var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

  var result = regex_hostport.exec( hostString );
  if ( result != null ) {
    host = result[1];
    if ( result[2] != null ) {
      port = result[3];
    }
  }
  return( [ host, port ] );
}


function handleBrowserHeaders(headers){
  var rh = {};
  let rheaders = {"cookie": "", "referer": "", "etag": "", "host": "", "if-modified-since": ""};
  for(var h in headers){
    if(!(h.toLowerCase() in rheaders)){
      rh[h] = headers[h];
    }
  }
  return rh;
}

function handleThirdPartyServerHeaders(headers, type){
  let rheaders = {"set-cookie": "", "set-cookie2": "", "etag": "", "last-modified": "", "content-length": ""};
  var rh = {};
  for(let h in headers){
    if(h.toLowerCase() == "location"){
    	rh[h] = rewrite.handleURL(headers[h], type);
    }else{
      if(!(h.toLowerCase() in rheaders)){
          rh[h] = headers[h];
      }
    }
  }
  return rh;
}

function handleThirdPartyServerResponse(sResponse, uResponse, url, type, uRequest){
  if((sResponse.headers["content-type"]) || uRequest.headers["accept"]){
    if((sResponse.headers["content-type"] && sResponse.headers["content-type"].toLowerCase().indexOf("text/css") >=0) || (uRequest.headers["accept"] && uRequest.headers["accept"].toLowerCase().indexOf("text/css")>=0)){
      rewrite.rewriteContent(sResponse, url, "css", uResponse);
    }else{
      sResponse.pipe(uResponse);
    }
  }else{
    sResponse.pipe(uResponse);
  }
}
	

function makeRequest(req, res){
	var surl = purl.parse(req.url, true); 
	var type = surl.query.type; 
  var rurl = surl.query.ru || surl.query["amp;ru"] || "";
  var ssurl = surl.query.su || surl.query["am;su"] || "";
	rurl = Buffer.from(rurl, 'base64').toString();
	ssurl = Buffer.from(ssurl, "base64").toString();

  if(type == "emb") {
         res.writeHead(200, {
          "Content-Type": "text/html; charset=UTF-8",
          //"Content-Security-Policy": "sandbox allow-scripts allow-same-origin"
        });
        res.end(rewrite.cctcifr(rurl));
  }else if(type == "open") {
         res.writeHead(200, {
          "Content-Type": "text/html; charset=UTF-8"
         });
        res.end(rewrite.cctc(rurl));
  }else if(type == "link") {
         res.writeHead(200, {
          "Content-Type": "text/html; charset=UTF-8", 
        });
        res.end(rewrite.cctcall(rurl));
  }else if(rurl){
   
  	var poptions = {
      url: rurl,
  		method: req.method,
  		headers: handleBrowserHeaders(req.headers)
  	};

  	let middleRequest = request(poptions);
  	middleRequest.on('response', function(sResponse){
  		res.writeHead(
     		sResponse.statusCode,
     		sResponse.statusMessage,	
        handleThirdPartyServerHeaders(sResponse.headers, type)
      );
      handleThirdPartyServerResponse(sResponse, res, rurl, type, req);
  	});

    middleRequest.on('error', function (error) {
        res.writeHead( 500 );
        res.end("Error");
    });


    req.on('data', function(chunk) {
      middleRequest.write( chunk );
    });

     req.on('end', function(){
        middleRequest.end();
     });
  }else{
    res.end();
  }
}


  //Listen to HTTPS connections ?
if(config.https_port){
  soptions = {
    key: fs.readFileSync(config.https_key),
    cert: fs.readFileSync(config.https_cert),
  }
  httpsServer = https.createServer(soptions, makeRequest).listen(config.https_port);
}

  //Listen to HTTP Connections ?
if(config.http_port){
  httpServer = http.createServer(makeRequest).listen(config.http_port);
}


//Sockets Forwarding....
  
  //Non-Secure Socket connections...
if(config.http_port){
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
if(config.https_port){
  WebSocketClient = require('websocket').client;

  wssServer = new WebSocketServer({
      httpServer: httpsServer,
      autoAcceptConnections: false
  });

  wssServer.on('request', function(request) {
      transfer(request);
  });
}


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