// global variable definitions
com = window.com || {};
com.marklogic = window.com.marklogic || {};
com.marklogic.widgets = window.com.marklogic.widgets || {};

com.marklogic.widgets.create = function(container) {
  this.container = container;
  
  this.vertical = true; // vertical or horizontal first rendering
  
  this._collections = new Array();
  this._permissions = new Array(); // ?
  
  this.currentRow = 0;
  this.currentColumn = 0;
  
  this.completePublisher = new com.marklogic.events.Publisher();
  
  this.controlCount = 0;
  this.fileDrops = new Array();
  this.fileDropFiles = new Array();
  
  this.override = false;
  this.overrideEndManual = false;
  this.overrideElementId = "";
  
  
  this._uriprefix = "/";
  
  this.controls = new Array();
  this.controlData = new Array();
  
  this._mode = "upload"; // upload or json or xml
  
  this._init();
};

com.marklogic.widgets.create.prototype._init = function() {
  var parentel = document.getElementById(this.container);
  parentel.innerHTML = 
    "<div id='" + this.container + "-create'>" +
      "<div class='create-title'>Create a new Document</div>" +
      "<form id='" + this.container + "-create-form' class='create-form'>" + 
        "<div class='create-row' id='" + this.container + "-create-row-0'>" +
          "<div class='create-col' id='" + this.container + "-create-row-0-col-0' style='float:left;'></div>" +
        "</div>" +
      "</form>"
    "</div><div style='";
};

// LAYOUT FUNCTIONS

com.marklogic.widgets.create.prototype._place = function(html,type,id) {
  if (this.override) {
    // override placement (allows containment within widget)
    document.getElementById(this.overrideElementId).innerHTML += html;
  } else {
    // place the html in the 'current' position, and increment
    var cid = this.container + "-create-row-" + this.currentRow + "-col-" + this.currentColumn;
    var cel = document.getElementById(cid);
    cel.innerHTML = html;
    if (this.vertical) {
      this.endRow();
    } else {
      // incrememnt column
      this.currentColumn++;
      // append column div to row element
      var h = "<div class='create-col' id='" + this.container + "-create-row-" + this.currentRow + "-col-" + this.currentColumn + "' style='float:left;'></div>";
      document.getElementById(this.container + "-create-row-" + this.currentRow).innerHTML += h;
    }
  }
  
  // add the control definition to our form references link - so save can process the form
  if (undefined != type && undefined != id) {
    this.controls.push({type: type,id: id});
  }
};

com.marklogic.widgets.create.prototype.endRow = function() {
  // clear previous row
  document.getElementById(this.container + "-create-row-" + this.currentRow).innerHTML += "<div style='clear:both'></div>";
  
    // create new row
    this.currentRow++;
    // reset column counter
    this.currentColumn = 0;
    // append div to form element
    var h = 
        "<div class='create-row' id='" + this.container + "-create-row-" + this.currentRow + "'>" +
          "<div class='create-col' id='" + this.container + "-create-row-" + this.currentRow + "-col-" + this.currentColumn + "' style='float:left;'></div>" +
        "</div>";
    document.getElementById(this.container + "-create-form").innerHTML += h;
    
  return this;
};

// Configuration methods for create widget - MUST be called before control creation methods

com.marklogic.widgets.create.prototype.mode = function(newMode) {
  this._mode = newMode;
  
  return this;
};

com.marklogic.widgets.create.prototype.uriprefix = function(prefix) {
  this._uriprefix = prefix;
  
  return this;
};

com.marklogic.widgets.create.prototype.horizontal = function() {
  // draw new controls horizontally, not vertically
  this.vertical = false;
  
  return this;
};

com.marklogic.widgets.create.prototype.collectionUser = function() {
  // add user- and this user's id to the collection list
  
  return this;
};

com.marklogic.widgets.create.prototype.collection = function(col) {
  this._collections.push(col);
  
  return this;
};

// FORM CONTROLS

com.marklogic.widgets.create.prototype.dnd = function() {
  // check for browser support
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    console.log("File API is supported by this browser");
  } else {
    console.log('The File APIs are not fully supported in this browser.');
  }
  
  // create a drag and drop widget
  var id = this.container + "-dnd-" + ++this.controlCount;
  /*
  var html = "<div id='" + id + "' class='create-dnd'></div>";
  
  this._place(html,"dnd",id);
  
  var fd = new FileDrop(id,{dragOverClass: "create-dnd-hover"});
  this.fileDrops[id] = fd;
  this.fileDropFiles[id] = new Array();
  
  var self = this;
  fd.on.send = function (files) {
    // store file objects until user clicks save
    for (var f = 0;f < files.length;f++) {
      self.fileDropFiles[id].push(files[f]);
    }
  };
  
  this.controlData[id] = {filedrop: fd};
  */
  
  var html = "<input type='file' id='" + id + "'/>";
  this._place(html,"dnd",id);
  
  var self = this;
  document.getElementById(id).onchange = function(evt) {
    console.log("file onchange fired");
    self.controlData[id] = {files: evt.target.files};
    console.log("Saved file data");
  };
  
  return this;
};

com.marklogic.widgets.create.prototype.permissions = function(allowMultiple,firstRoleArray,title_opt) {
  // add permissions control
  var id = this.container + "-permissions-" + (++this.controlCount);
  var html = "<div id='" + id + "' class='create-permissions'>" + 
    "<select id='" + id + "-select'>";
    
  for (var i = 0;i < firstRoleArray.length;i++) {
    html += "<option value='" + firstRoleArray[i] + "'>" + firstRoleArray[i] + "</option>";
  }
  
  html += "</select></div>";
  
  this._place(html,"permissions",id);
  return this;
};

com.marklogic.widgets.create.prototype.bar = function() {
  var id = this.container + "-bar-" + ++this.controlCount;
  var html = "<div id='" + id + "' class='create-bar'></div>";
  this._place(html,"bar",id);
  
  // override placement strategy
  this.override = true;
  this.overrideElementId = id;
  this.overrideEndManual = true;
  
  return this;
};

com.marklogic.widgets.create.prototype.endBar = function() {
  this.override = false;
  this.overrideEndManual = false;
  this.overrideElementId = "";
  
  //this._place("");
  
  return this;
};

com.marklogic.widgets.create.prototype.save = function(title_opt) {
  var id = this.container + "-create-save-" + ++this.controlCount;
  var title = "Save";
  if (undefined != title_opt) {
    title = title_opt;
  }
  
  var html = "<input class='create-save' type='submit' id='" + id + "' value='" + title + "' />";
  this._place(html,"save",id);
  
  var self = this;
  //document.getElementById(id).onclick = function(e) {console.log("got onclick");self._onSave(self);console.log("done onsave");e.stopPropagation();console.log("done stop prop");return false;}; // TODO Check this is valid
  document.getElementById(this.container + "-create-form").onsubmit = function() {self._onSave();return false;};
  // TODO find a way to do this without working at the form level
  
  return this;
};

// EVENT HANDLERS


com.marklogic.widgets.create.prototype.addCompleteListener = function(lis) {
  this.completePublisher.subscribe(lis);
};

com.marklogic.widgets.create.prototype.removeCompleteListener = function(lis) {
  this.completePublisher.unsubscribe(lis);
};

com.marklogic.widgets.create.prototype._onSave = function() {
  console.log("onSave called");
  // loop through controls
  // create uploaded or new json/xml document with those fields
  // save document with specified uri or uri prefix, collection(s), permissions
  if ("upload" == this._mode) {
    // find file upload control and get document
    var uploadCtl = null;
    var perms = new Array();
    for (var i = 0;i < this.controls.length;i++) {
      var ctl = this.controls[i];
      console.log("control: " + JSON.stringify(ctl));
      if ("dnd" == ctl.type) {
        uploadCtl = ctl;
      }
      // TODO extract other properties about this document
      if ("permissions" == ctl.type) {
        var e = document.getElementById(ctl.id + "-select");
        //console.log("selected value: " + e.value);
        //console.log("selected perm: " + e.selectedIndex);
        //console.log("selected perm value: " + e.options[e.selectedIndex]);
        //var str = e.options[e.selectedIndex].text;
        //console.log("adding permission: " + e.value + " = read");
        perms.push({role: e.value, permission: "read"});
      }
    }
    
    if (null != uploadCtl) {
      console.log("got uploadCtl");
      // get file info for upload
      var reader = new FileReader();
      //var files = this.controlData[uploadCtl.id].files;
      //var file = files[0]; // TODO handle multiple, none
      console.log("fetching file")
      var file = document.getElementById(uploadCtl.id).files[0];
      console.log("reading file");
      
      var self = this;
      
      reader.onload = (function(theFile) {
        return function(e) {
          var res = e.target.result;
          console.log("result: " + res);
          var cols = "";
          for (var i = 0;i < self._collections.length;i++) {
            if (0 != i) {
              cols += ",";
            }
            cols += self._collections[i];
          }
          // send as octet stream, filename for after URI prefix
          console.log("calling mldb save");
          var props = {
            contentType: file.type,
            collection: cols,
            permissions: perms
          }
          console.log("mime type: " + file.type);
          mldb.defaultconnection.save(res,self._uriprefix + file.name,props,function(result) {
            if (result.inError) {
              console.log("ERROR: " + result.doc);
            } else {
              console.log("SUCCESS: " + result.docuri);
              self.completePublisher.publish(result.docuri);
            }
          });
        }
      })(file);
      
      reader.readAsArrayBuffer(file);
    } else {
      // TODO
      console.log("upload ctl null");
    }
  } else {
    // TODO
    console.log("unknown mode: " + this._mode);
  }
};