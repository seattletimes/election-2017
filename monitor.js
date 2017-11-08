var async = require("async");
var request = require("request");
var crypto = require("crypto");
var chalk = require("chalk");
var spawn = require("child_process").spawn;


var pages = {
  sos: "http://results.vote.wa.gov/results/current/export/MediaResults.txt",
  sosCounty: "http://results.vote.wa.gov/results/current/export/MediaResultsByCounty.txt",
  turnout: "http://results.vote.wa.gov/results/current/export/MediaVoterTurnout.txt"
};

var results = {};

var getPage = function(key) {
  return new Promise(function(ok, fail) {
    var url = pages[key];
    request({ uri: url }, function(err, response, body) {
      var md5 = crypto.createHash("md5").update(body, "utf8");
      var hash = md5.digest("hex");
      if (!results[key]) {
        console.log(`Setting cache for %s - ${chalk.yellow("%s")}`, key, hash);
        results[key] = hash;
      } else {
        if (results[key] !== hash) {
          console.log(chalk.red("!!!!!!!! UPDATE ON %s !!!!!!!!!"), key);
          return ok(true);
        } else {
          console.log(`No change on %s - ${chalk.green("%s")}`, key, hash);
        }
      }
      ok(false);
    });
  });
};

var publish = function() {
  return new Promise(function(ok, fail) {
    var child = spawn("grunt", "sheets static publish:live".split(" "), { stdio: "inherit" });
    child.on("close", function() {
      ok();
    });
  });
};

var delay = function(duration) {
  return new Promise(ok => setTimeout(ok, duration));
};

var check = async function() {
  var keys = Object.keys(pages);
  console.log("============\nPolling: %s\n============", new Date());
  var results = await Promise.all(keys.map(k => getPage(k)));
  console.log("============\n\n")
  var updated = results.filter(d => d).length;
  if (updated) {
    await publish();
  }
  await delay(1000 * 60 * 2);
  check();
};

check();