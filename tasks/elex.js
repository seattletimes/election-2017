var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("elex", "Grab national results from AP", function() {
    var cmd = `elex results 2016-11-08 ${grunt.option("test") ? "-t " : ""} --results-level=state > data/national.csv`;
    shell.exec(cmd, this.async());
  });

};