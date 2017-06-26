const purl = require('url');
const css = require('css');
const Transform = require('stream').Transform;
const util = require('util');
const zlib = require('zlib');


const config = require('./config.json');
  //Server URL
const rwu = config.middleServerURL;


var rustypes = { // Content loading which is redirected to the middle party....
  "src":  rwu + "/r?type=src&ru=",
  "css":  rwu + "/r?type=css&ru=",
  "emb": rwu + "/r?type=emb&ru=",
  "xhr": rwu + "/r?type=xhr&ru=",
  "open": rwu + "/r?type=open&ru=",
  "link": rwu + "/r?type=link&ru="
};

var rProtocols = {
  "http:": "",
  "https:": "",
  "ws:": "",
  "wss:": ""
};

  //Rewrite a URL...
function handleURL(url, type){
  return rustypes[type] + Buffer.from(url).toString('base64');
}

  //Redirect only URLs that we can handle...
function dnp(url){
  //console.log(url);
  var parsed = purl.parse(url, true);
  if(parsed.protocol in rProtocols){
    return true;
  }else{
    return false;
  }
}

  //Stream reader for Rewriting CSS files
function Rewrite(options) {
  // allow use without new
  if (!(this instanceof Rewrite)) {
    return new Rewrite(options);
  }

  // init Transform
  Transform.call(this, options);
  this.incdata = "";
}
util.inherits(Rewrite, Transform);

Rewrite.prototype._transform = function (chunk, enc, cb) {
  var buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
  this.incdata += buffer.toString();
  cb();
};

Rewrite.prototype._flush = function(cb){
  if(this.type == "css"){
    try{
      this.push(parseCSS(this.incdata, this.url));
    }catch(e){
      this.push(this.incdata);
    }
  }else{
    this.push(this.incdata);
  }
  cb();
}

  //Main Function to rewrite content...
function rewriteContent(sResponse, url, type, uResponse){
  var rwt = new Rewrite();
  rwt.url = url; // Base URL to use for rewritting.
  rwt.type = type;
  if(sResponse.headers["content-encoding"]){
    switch(sResponse.headers["content-encoding"]){
      case "gzip":
        sResponse.pipe(zlib.createGunzip()).pipe(rwt).pipe(zlib.createGzip()).pipe(uResponse);
        break;
      case "deflate":
        sResponse.pipe(zlib.createDeflate()).pipe(rwt).pipe(zlib.createInflate()).pipe(uResponse);
        break;
      default:
        sResponse.pipe(rwt).pipe(uResponse);
        break;
    }
  }else{
    sResponse.pipe(rwt).pipe(uResponse);
  }
}

  //Rewrite a CSS file...
function parseCSS(input, base){
  try{
    var obj = css.parse(input);
    var sheet = obj.stylesheet;
    var allUrls = [];
    var regexp = /\burl\s*\(\s*["']?([^"'\r\n\)\(]+)["']?\s*\)/gi;
    for (var r=0; r<sheet.rules.length; r++){
      var rule = sheet.rules[r];
        switch(rule.type){
          case "rule":
            if(rule.declarations){
              for(var k=0;  k<rule.declarations.length; k++){

                switch (rule.declarations[k].property) {
                  case "background-image":
                    allUrls.push(rule.declarations[k].value.match(regexp));
                    break;
                  case "background":
                    allUrls.push(rule.declarations[k].value.match(regexp));
                    break;
                  case "src":
                      allUrls.push(rule.declarations[k].value.match(regexp));
                      break;
                  case "cursor": 
                     allUrls.push(rule.declarations[k].value.match(regexp));
                    break;
                  default:
                }
              }
            }
            break;
          case "font-face":
            if(rule.declarations){
              for(var k=0;  k<rule.declarations.length; k++){
                switch (rule.declarations[k].property) {
                  case "src":
                      allUrls.push(rule.declarations[k].value.match(regexp));
                      break;
                  default:
                }
              }
            }
            break;
          default:
            break;
        }

    }

    if(allUrls){
      for(var i=0; i<allUrls.length; i++){
        if(allUrls[i]){
          for(var j=0; j<allUrls[i].length; j++){
          var url = allUrls[i][j].match(/\((.*?)\)/)[1];
          if(url.indexOf("'") == 0 || url.indexOf('"') == 0){
            url = url.substring(1, url.length -1);
          }
          var surl = purl.resolve(base, url);
          if(!dnp(surl)){
            input = input.replace(url, surl);
          }else{
            input = input.replace(url, handleURL(surl, 'src'));
          }
        }
        }
      }
    }
    return input;
  }catch(e){
    return "";
  }
}


  //Maybe remove hash, parameters
function cctcifr(url){
  return `
    <html>
    <head>
      <style>
                body {
                    margin: 0px;
                    padding: 0px;
                }

                #root {
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }

                 iframe {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
              </style>
    </head>
    <body id="root">
      <a href="` + url + `" rel="noreferrer noopener" target="ifrtarget"></a>
      <!--a href="` + url + `" referrerpolicy="no-referrer" target="ifrtarget"></a-->
      <iframe name="ifrtarget" width="100%" heigth="100%"></iframe>
      <script>
        document.getElementsByTagName("a")[0].click();
      </script>
    </body>
   </html>`;
}

function cctc(url){
  return `
  <html>
  <body>
    <a href="` + url + `" rel="noreferrer noopener" target="_blank"></a>
    <script>
      document.getElementsByTagName("a")[0].click();
      //window.close();
    </script>
  </body>
 </html>`;
}


function cctcall(url){
  return `
  <html>
  <body>
    <iframe name="ifrtarget" width="100%" heigth="100%"></iframe>
    <a href="` + url + `" rel="noreferrer noopener"></a>
    <script>
      var ccc = document.getElementsByTagName("a")[0];
      if(window.top == window.self){
        //We have to handle the opening of a link....
        ccc.click();
        console.log(ccc);
      }else{
        //We are within an iframe, let just load the content within an iframe...
       
        ccc.target = "ifrtarget";
        ccc.click();
      }
    </script>
  </body>
 </html>`;
}

module.exports = {
  handleURL: handleURL,
  parseCSS: parseCSS,
  rewriteContent: rewriteContent,
  cctc: cctc,
  cctcifr: cctcifr,
  cctcall: cctcall,
};