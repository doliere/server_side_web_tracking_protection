
# Tracking Prevention Web Application Architecture
 The general architecture for tracking prevention is depicted by the following picture. 
 <p align="center">
  <img src="images/narchitecture-2.png?raw=true" alt="Tracking Prevention Web Application Architecture"/>
</p>

# Middle Party Server
The implemntation of the Rewrite Server is located under [middle_party_server](src/middle_party_server) folder.

The following picture shows the different components that form the Middle Party Server. Each of them is detailed in the following paragraphs.


<p align="center">
  <img src="images/middle.png?raw=true" alt="Middle Party Server"/>
</p>


Deploying the Middle Party Server consists of editing the [config.json](config.json) before starting the server by running [deploy.sh](deploy.sh)


Edit the content of [config.json](config.json) to reflect the characteristics of your Middle Party Server.
```json
{
  "middleServerURL": "https://www.middle.com", 
  "https_key": "./certificate/certificate.key", 
  "https_cert": "./certificate/certificate.crt", 
  "https_port": 443, 
  "http_port": 80
}
```
Now, we assume that you have [Node.js](https://nodejs.org) installed. If this is the case, the [npm](https://www.npmjs.com) package manager should also be installed. [deploy.sh](deploy.sh) will invoke npm to install the packages [request](https://www.npmjs.com/package/request), [css](https://www.npmjs.com/package/css) and [websocket](https://www.npmjs.com/package/websocket) required by the Middle Party Server to work correctly. Finally it will deploy the server.

The content of [deploy.sh](deploy.sh) is as follows.
```shell

npm install -g request
npm install -g css
npm install -g websocket
node middleparty.js
```
You can execute those commands separately or install them all in one command by executing
``` shell
sh deploy.sh
```

If you have reached this step, it means that you have a Middle Party Server running correctly
