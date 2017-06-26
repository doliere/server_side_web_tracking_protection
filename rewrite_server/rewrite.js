const purl = require('url');
const jsdom = require('jsdom');
const css = require('css');
const Transform = require('stream').Transform;
const util = require('util');
const zlib = require('zlib');
const config = require('./config.json');
const dotnotrewrite = require('./dotnotrewrite.json');

var rwu = config.middleServerURL;
const rewriteScriptLocation = config.dynamicContentRewriter;
var dynamics = rewriteScriptLocation;

 // Pages that one wants to rewrite.... or only HTML pages...// Or provide a file...
var rus = { // Content loading which is redirected to the middle party....
  "scripts":  rwu + "/r?type=src&ru=",
  "images":  rwu + "/r?type=src&ru=",
  "links": rwu + "/r?type=css&ru=",
  "anchors": rwu + "/r?type=src&ru=",
  "audios": rwu + "/r?type=src&ru=",
  "videos": rwu + "/r?type=src&ru=",
  "sources": rwu + "/r?type=src&ru=",
  "embeds": rwu + "/r?type=emb&ru=",
  "xhr": rwu + "/r?type=xhr&ru="
};


var rustypes = { // Content loading which is redirected to the middle party....
  "src":  rwu + "/r?type=src&ru=",
  "css":  rwu + "/r?type=css&ru=",
  "emb": rwu + "/r?type=emb&ru=",
  "xhr": rwu + "/r?type=xhr&ru=",
  "open": rwu + "/r?type=open&ru=",
  "link": rwu + "/r?type=link&ru=",
};

var rProtocols = {
  "http:": "",
  "https:": "",
  "ws:": "",
  "wss:": ""
};

  //Closure for handling URLs
function makeHandleURL(dotnotrewrite){
  var document = jsdom.jsdom("<p></p>");
  var aLink = document.createElement("a");
  return function handleURL(url, type){
    if(dotnotrewrite.indexOf(url) !== -1){
      aLink.href = url;
      if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined) && (dotnotrewrite.indexOf(aLink.origin) !== -1)){
        return rustypes[type] + Buffer.from(url).toString('base64');
      }else{
        return url;
      }
    }else{
      return url;
    }
  }
}

var rwucsp = dotnotrewrite;
rwucsp.push(rwu);
rwucsp = rwucsp.join(' ');


var handleURL = makeHandleURL(dotnotrewrite);
/*function handleURL(url, type){
  return rustypes[type] + Buffer.from(url).toString('base64');
}*/

  //Do not redirect
function dnp(url){
  //console.log(url);
  var parsed = purl.parse(url, true);
  if(parsed.protocol in rProtocols){
    return true;
  }
  else{
    return false;
  }
}

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
  }else if(this.type == "html"){
     try{
        this.push(reWriteHTML(this.incdata, this.url));
      }catch(e){
        this.push(this.incdata);
      }
  }else{
    this.push(this.incdata);
  }
  cb();
}


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




function reWriteHTML(rbody, rhost){
  var document = jsdom.jsdom(rbody);
  var aLink = document.createElement("a");
  var rhost = purl.parse(rhost, true).host;
  var scripts = document.getElementsByTagName("script");
  for(var s=0; s<scripts.length; s++){
    var script = scripts[s];
    if(!script.type || script.type === "text/javascript" || (script.language && script.language.indexOf('javascript') >=0)){
      var srcc = script.getAttribute('src'); // Get the src value here
      if(srcc){
        aLink.href = srcc;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
          script.setAttribute('src', handleURL(aLink.href, 'src'));
        }
       }
    }
  }

  var images = document.getElementsByTagName("img");
  for(var i=0; i<images.length; i++){
    var image = images[i];

      var srcc = image.getAttribute('src'); // Get the src value here
      if(srcc){
        aLink.href = srcc;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost ) && (aLink.protocol in rProtocols)){
          image.setAttribute('src', handleURL(aLink.href, 'src'));
         }
       }
  }

  var links = document.getElementsByTagName("link");
  for(var l=0; l<links.length; l++){
    var link = links[l];

      var srcc = link.getAttribute('href'); // Get the src value here
      if(srcc){
        aLink.href = srcc;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost)){
          link.setAttribute('href', handleURL(aLink.href, 'css'));
        }
       }
   }

  var links = document.getElementsByTagName("a");
  for(var l=0; l<links.length; l++){
    var link = links[l];

      var srcc = link.getAttribute('href'); // Get the src value here
      if(srcc){
        aLink.href = srcc;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
          link.setAttribute('href', handleURL(aLink.href, 'link'));
        }
       }
  }

  var links = document.getElementsByTagName("area");
  for(var l=0; l<links.length; l++){
    var link = links[l];

      var srcc = link.getAttribute('href'); // Get the src value here
      if(srcc){
        aLink.href = srcc;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
          link.setAttribute('href', handleURL(aLink.href, 'link'));
        }
       }
  }


    //Audios and videos sources
   var sources = document.getElementsByTagName("source");
   for(var s=0; s<sources.length; s++){
     var source = sources[s];

       var srcc = source.getAttribute('src'); // Get the src value here
       if(srcc){
         aLink.href = srcc;
         if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
           source.setAttribute('src', handleURL(aLink.href, 'src'));
         }
        }
    }

      //Video poster images
  var videos = document.getElementsByTagName("video");
  for(var v=0; v<videos.length; v++){
    var video = videos[v];

      var poster = video.getAttribute('poster'); // Get the src value here
      if(poster){
        aLink.href = poster;
        if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
          //console.log(aLink.href);
          video.setAttribute('poster', handleURL(aLink.href, 'src'));
        }
       }

      var srcc = video.getAttribute('src'); // Get the src value here
       if(srcc){
       aLink.href = srcc;
       if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
         video.setAttribute('src', handleURL(aLink.href, 'src'));
       }
      }
  }

  var audios = document.getElementsByTagName("audio");
  for(var v=0; v<audios.length; v++){
    var audio = audios[v];
      var srcc = audio.getAttribute('src'); // Get the src value here
       if(srcc){
       aLink.href = srcc;
       if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
         audio.setAttribute('src', handleURL(aLink.href, 'src'));
       }
      }
   }


   var iframes = document.getElementsByTagName("iframe");
   for(var i=0; i<iframes.length; i++){
     var iframe = iframes[i];
     var srcc = iframe.getAttribute('src');
     if(srcc){
       aLink.href = srcc;
       if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
         iframe.setAttribute('src', handleURL(aLink.href, 'emb'));
       }
     }
   }

   var iframes = document.getElementsByTagName("embed");
   for(var i=0; i<iframes.length; i++){
     var iframe = iframes[i];
     var srcc = iframe.getAttribute('src');
     if(srcc){
       aLink.href = srcc;
       if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
         iframe.setAttribute('src', handleURL(aLink.href, 'emb'));
       }
     }
   }

   var iframes = document.getElementsByTagName("object");
   for(var i=0; i<iframes.length; i++){
     var iframe = iframes[i];
     var srcc = iframe.getAttribute('data');
     if(srcc){
       aLink.href = srcc;
       if(!(aLink.origin == null || aLink.origin == "" || aLink.origin == undefined || aLink.host == rhost) && (aLink.protocol in rProtocols)){
         iframe.setAttribute('data', handleURL(aLink.href, 'emb'));
       }
     }
   }
   var head = document.getElementsByTagName("head")[0];
   var script = document.createElement("script");
   script.src = dynamics;
   if(head.firstChild){
     head.insertBefore(script, head.firstChild);
   }else{
     head.appendChild(script);
   }

   return document.documentElement.outerHTML;
}



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

function csp(){
  return "default-src 'self' " + rwucsp + "; script-src 'unsafe-inline' 'unsafe-eval' 'self' " + rwucsp + "; style-src 'unsafe-inline' 'unsafe-eval' 'self' " + rwucsp + ";";
}

module.exports = {
  getCSP: csp,
  handleURL: handleURL,
  parseCSS: parseCSS,
  rewriteContent: rewriteContent,
  Rewrite: Rewrite
};
