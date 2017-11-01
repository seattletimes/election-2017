var csv = require("csv");
var fs = require("fs");
var path = require("path");

var isVerbose = process.argv.indexOf("--verbose") > -1;

var sos = fs.readFileSync("temp/MediaResults.tsv");
var sosCounty = fs.readFileSync("temp/MediaResultsByCounty.tsv");
var incumbents = fs.readFileSync("temp/incumbents.csv");

var raceColumns = "id name description category subcategory featured map locator called url filter".split(/\s+/);
var candidateColumns = "race  id  name  party incumbent description original  filter".split(/\s+/);

var titleCase = function(s) {
  var words = s.trim().split(/\s+/);
  var ignore = new Set(["of", "the", "and", "for"]);
  words = words.map(w => {
    if (ignore.has(w)) return w;
    return w[0].toUpperCase() + w.slice(1).toLowerCase();
  });
  return words.join(" ");
};

var races = {};

var parse = function(contents, delimiter = "\t") {
  return new Promise(function(ok, fail) {
    csv.parse(contents, {
      delimiter,
      columns: true
    }, function(err, rows) {
      if (err) return fail(err);
      ok(rows);
    });
  });
};

var serialize = function(rows, columns) {
  return new Promise(function(ok, fail) {
    csv.stringify(rows, {
      columns,
      header: true
    }, function(err, data) {
      if (err) return fail(err);
      ok(data);
    });
  });
};

var categories = {
  "State Executive": "Statewide"
};
var countyList = [
  "Pierce",
  "King",
  "Snohomish",
  "Kitsap"
];

// move these up to the top of the sheet
var featured = [
  41167,
  41169,
  115469,
  41168,
  361,
  40998
];

var fixParty = function(p) {
  var parties = {
    "Republican": "R",
    "Democrat": "D",
    "Libertarian": "L",
    "Independent": "I"
  };
  for (var k in parties) {
    if (p.indexOf(k) >= 0) return parties[k];
  }
  return p;
};

var init = async function() {
  
  var stateRows = await parse(sos);
  var countyRows = await parse(sosCounty);

  var incumbency = {};
  (await parse(incumbents, ",")).forEach(r => incumbency[r.BallotID] = "x");

  var rows = stateRows.concat(countyRows);

  // assemble unique race/candidate lists
  rows.forEach(function(r) {
    var id = r.RaceID.trim() * 1;
    var type = r.RaceJurisdictionTypeName;
    var county = r.CountyName;
    if (county && countyList.indexOf(county) == -1) return;
    var featureIndex = featured.indexOf(id) + 1;
    if (!races[id]) races[id] = {
      id,
      candidates: [],
      county: r.CountyName,
      name: titleCase(r.RaceName),
      category: categories[type] || type || "Local",
      subcategory: r.CountyName,
      featured: featureIndex || ""
    };
    races[id].candidates.push({
      race: id,
      id: r.BallotID,
      name: r.BallotName,
      party: fixParty(r.PartyName),
      incumbent: incumbency[r.BallotID]
    });
  });

  var outputRaces = [];
  var outputCandidates = [];

  // cull uncontested races
  for (var r in races) {
    var race = races[r];
    if (race.candidates.length <= 1) {
      delete races[r];
      if (isVerbose) console.log("Uncontested: ", race.name);
      continue;
    }
    outputRaces.push(race);
    outputCandidates.push(...race.candidates);
  }

  outputRaces.sort((a, b) => (a.featured || Infinity) - (b.featured || Infinity));

  fs.writeFileSync("temp/races.csv", await serialize(outputRaces, raceColumns));
  fs.writeFileSync("temp/candidates.csv", await serialize(outputCandidates, candidateColumns));
};

init();
