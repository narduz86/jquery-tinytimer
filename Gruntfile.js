module.exports = function( grunt ) {

	grunt.initConfig( {

		// Import package manifest
		pkg: grunt.file.readJSON( "package.json" ),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage || pkg.repository.url %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author %>\n" +
				" *  Under <%= pkg.license %> License\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			options: {
				banner: "<%= meta.banner %>"
			},
			dist: {
				src: [ "src/jquery.tinytimer.js" ],
				dest: "dist/jquery.tinytimer.js"
			}
		},

		// Minify definitions
		uglify: {
			dist: {
				src: [ "dist/jquery.tinytimer.js" ],
				dest: "dist/jquery.tinytimer.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Lint definitions
		jshint: {
			files: [ "src/jquery.tinytimer.js", "test/**/*.js" ],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		jscs: {
			src: "src/**/*.js",
			options: {
				config: ".jscsrc"
			}
		},

		// karma test runner
		karma: {
			local: {
				configFile: "karma.conf.js",
				background: false,
				singleRun: false,
				browsers: []
			},
			travis: {
				configFile: "karma.conf.js",
				background: false,
				singleRun: false,
				browsers: ["Chrome_travis_ci", "Firefox", "Safari", "Opera", "IE", "Edge"],
				customLaunchers: {
					Chrome_travis_ci: {
						base: 'Chrome',
						flags: ['--no-sandbox']
					}
				}
			}
		},

		// watch for changes to source
		// Better than calling grunt a million times
		// (call 'grunt watch')
		watch: {
			js: {
				files: [ "src/*", "test/**/*" ],
				tasks: [ "default" ]
			}
		}

	} );

	grunt.loadNpmTasks( "grunt-contrib-concat" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-jscs" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-karma" );

	grunt.registerTask( "lint", [ "jshint", "jscs" ] );
	grunt.registerTask( "build", [ "concat", "uglify" ] );
	grunt.registerTask( "default", [ "lint", "build", "karma:local" ] );
	grunt.registerTask( "travis", [ "lint", "build", "karma:travis" ] );
	// grunt.registerTask( "default", [ "jshint", "build" ] );
};
