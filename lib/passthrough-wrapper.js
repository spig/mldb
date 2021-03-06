var http = require('http'),
    noop = require("./noop");

var PassThroughWrapper = function() {
  this.configure();
};

PassThroughWrapper.prototype.configure = function(username,password,logger) {
  // don't save username or password
};
PassThroughWrapper.prototype.request = function(options,callback_opt) {
  return http.request(options,(callback_opt || noop));
};
PassThroughWrapper.prototype.get = function(options,callback_opt) {
  return http.get(options,(callback_opt || noop));
};
  
module.exports = function() {return new PassThroughWrapper()};
