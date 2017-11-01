var request = require("request");
var fs = require("fs");
var csv = require("csv");

var url = "http://results.vote.wa.gov/results/current/export/MediaVoterTurnout.txt";

module.exports = function(c) {

  var parser = csv.parse({
    columns: true,
    auto_parse: true,
    delimiter: "\t"
  });
  var turnout = {
    Total: {}
  };
  parser.on("data", function(line) {
    var county = line.CountyName;
    turnout[county] = line;
  });
  parser.on("finish", function() {
    var expected = turnout.Total.NumberOfRegisteredVoters * .84;
    var counted = turnout.Total.TotalBallotsCast * 1;
    turnout.percentage = Math.round(counted / expected * 1000) / 10;
    c(null, turnout);
  });

  var project = require("../../project.json");
  if (project.caching && fs.existsSync("./temp/turnout.txt")) {
    var cached = fs.createReadStream("./temp/turnout.txt");
    cached.pipe(parser);
  } else {
    var req = request(url);
    req.pipe(parser);
    if (!fs.existsSync("./temp")) {
      fs.mkdirSync("temp");
    }
    var temp = fs.createWriteStream("./temp/turnout.txt");
    req.pipe(temp);
  }

};