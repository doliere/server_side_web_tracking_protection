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

Edit the content of [config.json](config.json) to reflect your own server parameters.
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

Now, we assume that you have [Node.js](https://nodejs.org) installed. If this is the case, the [npm](https://www.npmjs.com) package manager should also be installed. [deploy.sh](deploy.sh) will invoke npm to install the packages [request](https://www.npmjs.com/package/request), [jsdom](https://www.npmjs.com/package/jsdom), [css](https://www.npmjs.com/package/css) and [websocket](https://www.npmjs.com/package/websocket) required by the Rewrite Server to work correctly. Finally it will deploy the server.

The content of [deploy.sh](deploy.sh) is as follows.
```shell
npm install -g request
npm install -g jsdom
npm install -g css
npm install -g websocket
node rewriteserver.js
```
You can execute those commands separately or install them all in one command by executing
```
sh deploy.sh
```
If you have reached this step, it means that you have a Rewrite Server running correctly.

Last but not least, you should now restart your original server on the port number that you have specified in the configuration file at the entry [originalServerNewPort]. After that, you are all set, and you should be able to access your website the same way as before. Now all third party content will be redirected to the Middle Party Server where tracking information will be removed.

You can also customize the Rewrite Server not to rewrite some third party contents. Take the example of OAuth or your own CDNs which you trust and do not want to redirect to the Middle Party Server. You can exclude their domains by editing the file [donotrewrite.json](donotrewrite.json)

The initial content of [donotrewrite.json](donotrewrite.json) is an empty JSON array. 
```json
[]
```
You can add URLs of origins of URLs that you do not want to be rewritten. This is can your own CDNs or some third party identity providers you are using in your application.

