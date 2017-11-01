module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("content", "Load content from data files", ["state", "json", "csv", "markdown"]);
  grunt.registerTask("pull", "Grab/process election data", ["sheets", "content", "scrape"]);
  grunt.registerTask("template", "Build HTML from content/templates", ["content", "scrape", "build"]);
  grunt.registerTask("static", "Build all files", ["copy", "bundle", "less", "template"]);
  grunt.registerTask("default", ["clean", "static", "connect:dev", "watch"]);

};
