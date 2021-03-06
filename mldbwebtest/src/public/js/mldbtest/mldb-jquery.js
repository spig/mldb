
var m = window.mldb || {};
var b = m.bindings || {};
m.bindings = b;
b.jquery = function() {
  // constructor
  $.ajaxSetup({
    contentType : 'application/json',
    processData : false
  });
};

b.jquery.prototype.supportsAdmin = function() {
  return false; // can only access our own REST HTTP Server
};

b.jquery.prototype.configure = function(username,password,logger) {
  this.logger = logger;
};

b.jquery.prototype.request = function(reqname,options,content,callback) {
  var self = this;
  
  var data = null;
  if (undefined != content && null != content) {
    console.log("content typeof: " + (typeof content));
    if ("ArrayBuffer" == typeof content) {
      data = content;
    } else if ("object" == typeof content) {
      data = JSON.stringify(content);
    } else if ("string" == typeof content) {
      data = content;
    }
  }
  var ct = options.contentType;
  if (undefined == ct) {
    ct = "application/json";
  }
  $.ajax(options.path,{
    contentType: ct,
    type: options.method.toLowerCase(), 
    data: data,
    dataType: 'json',
    success: function(data,textStatus,xhr) {
      var res = {};
      res.inError = false;
      res.statusCode = xhr.status;
      var wibble;
      if (undefined != data && null != data) {
        self.logger.debug("Data type: " + (typeof data));
        self.logger.debug("Data value: " + data);
        var xml = xhr.responseXML;
        if (undefined != xml) {
          res.format = "xml";
          res.doc = xml;
        } else {
          self.logger.debug("response text: " + xhr.responseText);
          try {
            self.logger.debug("parsing xhr.responseText");
            wibble = $.parseJSON(xhr.responseText); // successes are JSON text (needs parsing)
            res.format = "json";
            self.logger.debug("js raw: " + wibble);
            self.logger.debug("json str: " + JSON.stringify(wibble));
            self.logger.debug("Parsed JSON successfully");
          } catch (ex) {
            // do nothing - likely a blank XML document
            self.logger.debug("Exception: " + ex);
          }
        }
      }
      res.doc = wibble;
      self.logger.debug("json final str: " + JSON.stringify(res.doc));
      // TODO support XML returned too
      callback(res);
    } , error: function(xhr,textStatus,errorThrown) {
      // get failure code to determine what to do next
      var res = {};
      if (xhr.status == 303) {
        res.location = xhr.getResponseHeader("location"); // for newly created document / upload
      }
      res.inError = true;
      res.statusCode = xhr.status;
      res.doc = xhr.responseXML; // failures are returned in XML
      if (undefined == res.doc) {
        res.doc = xhr.responseText;
        res.format = "text"; // TODO handle binary content
        try {
          self.logger.debug("parsing xhr.responseText");
          var wibble = $.parseJSON(xhr.responseText); // successes are JSON text (needs parsing)
          res.format = "json";
          self.logger.debug("js raw: " + wibble);
          self.logger.debug("json str: " + JSON.stringify(wibble));
          self.logger.debug("Parsed JSON successfully");
          res.doc = wibble;
        } catch (ex) {
          // do nothing - likely a blank XML document
          self.logger.debug("Exception: " + ex);
        }
      } else {
        res.format = "xml";
      }
      res.details = res.doc;
      if ("string" == typeof res.details) { // TODO add response content type check (document could be plain text!)
        res.details = textToXML(res.details);
      }
      if (undefined != res.details.nodeType) { // must be an XML document
        res.details = xmlToJson(res.details); // convert text in res.doc to XML first
      } 
      callback(res);
    }
  });
  
  
};

