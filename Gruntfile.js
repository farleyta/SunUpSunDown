module.exports = function(grunt) {

  grunt.initConfig({
    
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      vendor: {
        src: ['js/vendor/jquery*.js', 'js/vendor/*.js', '!js/vendor/all.js', '!js/vendor/modernizr-custom.min.js'],
        dest: 'js/vendor/all.js'
      },
    },

    uglify: {
      options: {
        mangle: false
      },
      app: {
        files: {
          'js/sunupsundown.min.js': ['js/sunupsundown/sunupsundown.js']
        }
      },
      vendor: {
        files: {
          'js/vendor.min.js': ['js/vendor/all.js']
        }
      }
    },

    jshint: {
      // no need to lint app.js – just a concat of app subdir js files
      all: ['Gruntfile.js', 'js/{,**/}*.js', '!js/*.min.js', '!js/vendor/*']
    },

    compass: {
      dist: {
        options: {
          cssDir: 'css',
          sassDir: 'sass',
          imagesDir: 'img',
          javascriptsDir: 'js',
          fontsDir: 'css/fonts',
          httpImagesPath: '../<%= compass.dist.options.imagesDir %>',
          assetCacheBuster: 'none',
          outputStyle: 'compressed',
          require: 'compass-normalize'
        }
      }
    },

    watch: {
      compass: {
        files: ['sass/{,**/}*.scss'],
        tasks: ['compass']
      },
      js: {
        files: ['<%= jshint.all %>'], // exclude the vendor files from linting,
        tasks: ['jshint', 'uglify:app']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          '*.html',
          'css/style.css',
          'js/*.js',
          'images/{,**/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('setup', ['concat:vendor', 'uglify:vendor']);

};