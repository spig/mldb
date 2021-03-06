var mldb = require("../../mldb"),
    tests = exports,
    ensure = require('ensure'), 
    assert = require('assert'),
    winston = require('winston');

     var logger = new (winston.Logger)({
       transports: [
          new winston.transports.File({ filename: 'logs/006-save-get-delete-in-loop.log' })
       ],
       exceptionHandlers: [
          new winston.transports.File({ filename: 'logs/006-save-get-delete-in-loop.log' })
       ]
     });

tests.basics = function(callback) {
  var db = new mldb(); // default options
  db.setLogger(logger);
  
  var results = new Array();
  
  for(var i = 0;i < 100;i++) {
    results[i] = "starting";
    logger.debug("****** Creating doc: " + i);
    db.save({from: "test", to: "all", body: "wibble"},"/messages/" + i, {collection: "messages"},function(result) {
      // now fetch it
      var uri = result.docuri;
      logger.debug("****** Doc created. Fetching doc.: " + uri);
      db.get(uri, function(result) {
        // now print it
        logger.debug("****** Doc content: " + result.docuri + ": " + JSON.stringify(result.doc));
        
        // now delete it
        logger.debug("****** deleting doc");
        var uri2 = result.docuri;
        var newi = 1*(uri2.substring(uri2.lastIndexOf("/") + 1));
        db.delete(uri2, function(result) {
          logger.debug("****** Doc deleted: " + newi + " : " + uri2);
          //assert.isNull(result.doc);
          results[newi] = !result.inError;
        });
      });
    });
  }
  
  // pause for 3 minutes (should be plenty)
  var sleep = require('sleep');
  sleep.sleep(180);
  
  var result = true;
  var truecount = 0;
  for (var i = 0;i < 100;i++) {
    result = result && (true == results[i]);
    if (true == results[i]) {
      truecount++;
    }
  }
  logger.debug("Complete truecount: " + truecount);
  callback(result);
  
};

tests.basics_ok = function(t) {
  assert.ok(t);
};


ensure(__filename, tests, module,process.argv[2]);
