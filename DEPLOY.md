# Tracking Prevention Web Application Architecture
 The general architecture for tracking prevention is depicted by the following picture. 
 <p align="center">
  <img src="images/narchitecture-2.png?raw=true" alt="Tracking Prevention Web Application Architecture"/>
</p>

# Rewrite Server
The implemntation of the Rewrite Server is located under [rewrite_server](rewrite_server) folder.

The Rewrite Server is composed with different components which implementation details are discussed below. The following picture shows those components and their interactions and integration with the original web application server

<p align="center">
  <img src="images/rewrite.png?raw=true" alt="Rewrite Server"/>
</p>

Deploying the Rewrite Server consists of editing the [config.json](config.json) before starting the server by running [deploy.sh](deploy.sh)
```json 
{
  "originalServerHost": "www.example.com",
  "originalServerNewPort": 8080,
  "rewriteServerHttpPort":80,
  "https_key": "./certificate/certificate.key",
  "https_cert": "./certificate/certificate.crt",
  "rewriteServerHttpsPort": 443,
  "dynamicContentRewriter": "dynamic.js",
  "middleServerURL": "https://www.middle.com"

}
```

We assume that you have [Node.js](https://nodejs.org) installed. If this is the case, the [npm](https://www.npmjs.com) package manager should also be installed. [deploy.sh](deploy.sh) will invoke npm to install the packages [request](https://www.npmjs.com/package/request), [jsdom](https://www.npmjs.com/package/jsdom), [css](https://www.npmjs.com/package/css) and [websocket](https://www.npmjs.com/package/websocket) required by the Rewrite Server to work correctly. Finally it will deploy the server.
