var rwuh = "sstp-middleparty.inria.fr";
  (function(window, document){
    var rwuh = "sstp-middleparty.inria.fr";
    var rwu = "https://" + rwuh;
      //Redirection objects
    var rus = { // Content loading which is redirected to the middle party....
      "src":  rwu + "/r?type=src&ru=",
      "css":  rwu + "/r?type=css&ru=",
      "emb": rwu + "/r?type=emb&ru=",
      "xhr": rwu + "/r?type=xhr&ru=",
      "open": rwu + "/r?type=open&ru=",
      "link": rwu + "/r?type=link&ru=",
      "ws:": "ws://" + rwuh + "/r?type=ws&ru=",
      "wss:": "wss://" + rwuh + "/r?type=wss&ru=",
    };

    var rProtocols = {
      "http:": "",
      "https:": "",
      "ws:": "",
      "wss:": ""
    }

    function handleURL(url, type){
      var a = document.createElement("a");
      a.sat('href', url);
      if(!(a.origin == document.location.origin || (a.origin == rwu)) && (a.protocol in rProtocols)){
        if(a.protocol == "ws:" || a.protocol == "wss:"){
          return rus[a.protocol] + btoa(a.href);
        }else{
          return rus[type] + btoa(a.href);
        }
      }
      return a.href;
    }

     function isThirdParty(url, type){
      var a = document.createElement("a");
      a.setAttribute('href', url);
      if(!(a.origin == document.location.origin || (a.origin == rwu))){
        return true;
      }
      return false;
    }


    if(Image){
      Image.prototype.sat = Image.prototype.setAttribute;
      Image.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(Image.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(Image.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });

      Object.defineProperty(Image.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }


    if(HTMLImageElement && !HTMLImageElement.prototype.sat){
      HTMLImageElement.prototype.sat = HTMLImageElement.prototype.setAttribute;
      HTMLImageElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLImageElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLImageElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

    if(HTMLScriptElement){
      HTMLScriptElement.prototype.sat = HTMLScriptElement.prototype.setAttribute;
      HTMLScriptElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLScriptElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLScriptElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLScriptElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }


      //Source Elements
    if(HTMLSourceElement){
      HTMLSourceElement.prototype.sat = HTMLSourceElement.prototype.setAttribute;
      HTMLSourceElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLSourceElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLSourceElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLSourceElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }


      //Video elements
    if(HTMLVideoElement){
      HTMLVideoElement.prototype.sat = HTMLVideoElement.prototype.setAttribute;
      HTMLVideoElement.prototype.setAttribute = function(at, nv){
          if(at === "src" || at === "poster"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLVideoElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLVideoElement.prototype, 'poster', {
        set: function(nv) {this.setAttribute('poster', nv)},
        configurable: false,
        get: function() {return this.getAttribute('poster');}
      });

      Object.defineProperty(HTMLVideoElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLVideoElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

      //Audio Elements
    if(HTMLAudioElement){ 
      HTMLAudioElement.prototype.sat = HTMLAudioElement.prototype.setAttribute;
      HTMLAudioElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'src'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLAudioElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLAudioElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLAudioElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

      //Link Elements
    if(HTMLLinkElement){
      HTMLLinkElement.prototype.sat = HTMLLinkElement.prototype.setAttribute;
      HTMLLinkElement.prototype.setAttribute = function(at, nv){
          if(at === "href"){
            this.sat(at, handleURL(nv, 'css'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLLinkElement.prototype, 'href', {
        set: function(nv) {this.setAttribute('href', nv)},
        configurable: false,
        get: function() {return this.getAttribute('href');}
      });

      Object.defineProperty(HTMLLinkElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLLinkElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

    HTMLAnchorElement.prototype.sat = HTMLAnchorElement.prototype.setAttribute;
    HTMLAnchorElement.prototype.setAttribute = function(at, nv){
        if(at === "href"){
          this.sat(at, handleURL(nv, 'link'));
        }else{
          this.sat(at, nv);
        }
    };

    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      set: function(nv) {this.setAttribute('href', nv)},
      configurable: false
    });

    Object.defineProperty(HTMLAnchorElement.prototype, 'sat', {
      configurable: false, writable: false, editable: false
    });
    
    Object.defineProperty(HTMLAnchorElement.prototype, 'setAttribute', {
      configurable: false, writable: false, editable: false
    });

      //Area element...
    HTMLAreaElement.prototype.sat = HTMLAreaElement.prototype.setAttribute;
    HTMLAreaElement.prototype.setAttribute = function(at, nv){
        if(at === "href"){
          this.sat(at, handleURL(nv, 'link'));
        }else{
          this.sat(at, nv);
        }
    };

    Object.defineProperty(HTMLAreaElement.prototype, 'href', {
      set: function(nv) {this.setAttribute('href', nv)},
      configurable: false
    });

    Object.defineProperty(HTMLAreaElement.prototype, 'sat', {
      configurable: false, writable: false, editable: false
    });
    
    Object.defineProperty(HTMLAreaElement.prototype, 'setAttribute', {
      configurable: false, writable: false, editable: false
    });

    if(HTMLIFrameElement){
      HTMLIFrameElement.prototype.sat = HTMLIFrameElement.prototype.setAttribute;
      HTMLIFrameElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'emb'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });


      Object.defineProperty(HTMLIFrameElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLIFrameElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

      //Embed elements
    if(HTMLEmbedElement){
      HTMLEmbedElement.prototype.sat = HTMLEmbedElement.prototype.setAttribute;
      HTMLEmbedElement.prototype.setAttribute = function(at, nv){
          if(at === "src"){
            this.sat(at, handleURL(nv, 'emb'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLEmbedElement.prototype, 'src', {
        set: function(nv) {this.setAttribute('src', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLEmbedElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLEmbedElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }

      //Objects elements
    if(HTMLObjectElement){
      HTMLObjectElement.prototype.sat = HTMLObjectElement.prototype.setAttribute;
      HTMLObjectElement.prototype.setAttribute = function(at, nv){
          if(at === "data"){
            this.sat(at, handleURL(nv, 'emb'));
          }else{
            this.sat(at, nv);
          }
      };

      Object.defineProperty(HTMLObjectElement.prototype, 'data', {
        set: function(nv) {this.setAttribute('data', nv)},
        configurable: false,
        get: function() {return this.getAttribute('src');}
      });

      Object.defineProperty(HTMLEmbedElement.prototype, 'sat', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(HTMLEmbedElement.prototype, 'setAttribute', {
        configurable: false, writable: false, editable: false
      });
    }
    
    function getXMLHttpRequestObject() {
      if(XMLHttpRequest){
        return window.XMLHttpRequest;
      }else{
          try{
            return ActiveXObject("MSXML2.XMLHTTP.3.0");
          }catch(ex) {
            return null;
          }
      }
    }

    XMLHttpRequest = getXMLHttpRequestObject();
    if(XMLHttpRequest){
      XMLHttpRequest.prototype.op = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(m, u, b, o, t) {
          this.op(m, handleURL(nv, 'xhr') +"&su=" + btoa(document.location.origin), b, o, t);
      };

      Object.defineProperty(XMLHttpRequest.prototype, 'op', {
        configurable: false, writable: false, editable: false
      });
      
      Object.defineProperty(XMLHttpRequest.prototype, 'open', {
        configurable: false, writable: false, editable: false
      });
    }

    if(window.open){
      window.op = window.open;
      window.open = function(url, name, specs, replace){
        return window.op(handleURL(url, 'open'), name, specs, replace);
      }
      Object.defineProperty(window, 'op', {
        configurable: false, writable: false, editable: false
      });

      Object.defineProperty(window, 'open', {
        configurable: false, writable: false, editable: false
      });
    }





    OBJ = {}; 
    if(EventSource){
      OBJ.EventSource = EventSource;
      EventSource = function(url, options){
        return new OBJ.EventSource(handleURL(url, "src"), options);
      };
    }
    if(Request){
      OBJ.Request = Request;
      Request = function(input, init){
        if(typeof input == "string"){
            return new OBJ.Request( handleURL(input, 'src'), init);
        }
        return new OBJ.Request(input, init);
      };
    }
    
    if(WebSocket){
      OBJ.WebSocket = WebSocket;
      WebSocket = function(url, protocols){
        return new OBJ.WebSocket(handleURL(url, 'ws'), protocols);
      };
    }

    Object.defineProperty(window, 'OBJ', {
        configurable: false, writable: false, editable: false
    });

      //Stateless...

    Object.defineProperty(document, "URL", {
      get: function() {return ""},
      configurable: false, editable: false
    });

    //delete window.navigator; // Navigator object
    //delete window.screen; // Screen object

    if(HTMLCanvasElement){
      Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
        get: function() {return function(){return Math.random()}},
        configurable: false, editable: false
      });
      
       Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        get: function() {return function(cb, mtype, qa){cb(Math.random())}},
        configurable: false, editable: false
      });
    }

    //(Object.freeze||Object)(Object.prototype);

}(window, document));
