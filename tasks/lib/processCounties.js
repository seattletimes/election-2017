module.exports = function(counties, races, raceConfig) {

  //aggregate county results
  //this is only for single-county races
  //anything statewide skips this
  var aggregated = {};
  counties.forEach(function(county) {
    var race = races[county.race];
    if (!race) console.log("No race for this county", county);
    //do we have statewide results for this?
    if (race.results.length) return;
    //if not, create temporary aggregation info
    if (!aggregated[county.race]) aggregated[county.race] = race;
    if (!race.aggregate) race.aggregate = {};
    if (!race.aggregate[county.candidate]) race.aggregate[county.candidate] = [];
    //add the race to the aggregation
    race.aggregate[county.candidate].push(county);
  });
  //aggregated is a hash of race ID to race object
  Object.keys(aggregated).forEach(function(c) {
    var total = 0;
    var race = aggregated[c];
    for (var candidate in race.aggregate) {
      var list = race.aggregate[candidate];
      var result = {};
      //object.create doesn't work for JSON output, so manually copy values
      for (var key in list[0]) result[key] = list[0][key];
      //override the copied location
      result.location = "Aggregated";
      result.votes = list.reduce(function(prev, now) { return prev + now.votes }, 0);
      race.results.push(result);
      total += result.votes;
    }
    //figure percentages for each
    race.results.forEach(function(result) {
      result.percent = Math.round(result.votes / total * 1000) / 10;
    });
    delete race.aggregate;
  });

  //add county data to mappable races
  var mapped = {};
  raceConfig.forEach(function(config) {
    if (config.map) {
      var countyMap = {};
      counties.forEach(function(result) {
        // console.log(result);
        if (result.race == config.id) {
          if (!countyMap[result.location]) {
            countyMap[result.location] = {
              winner: null,
              results: []
            };
          }
          var county = countyMap[result.location];
          county.results.push(result);
          if (result.votes > 0 && (!county.winner || county.winner.votes < result.votes)) {
            county.winner = result;
          }
        }
      });
      races[config.id].map = mapped[config.id] = countyMap;
    }
  });

  return {
    mapped: mapped
  };

};