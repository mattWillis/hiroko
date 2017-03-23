var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  $ = gulpLoadPlugins({}),
  log = require('color-log'),
  browserSync = require('browser-sync'),
  runSequence = require('run-sequence'),
  environment = $.util.env.type || 'development',
  fs = require('fs'),
  paths = {
    project: __dirname,
    app: 'app',
    dist: 'dist'
  };

var cssFramework = require("bourbon").includePaths;
var swipebox = paths.project + '/node_modules/swipebox/scss/';

var swipeJS = paths.project + '/node_modules/swipebox/src/jquery.swipebox.js';


gulp.task('clean', function() {
  return gulp.src(paths.dist, {read: false})
    .pipe($.rimraf());
});

/* Copy all resources to dist */
copyResources = function() {
  log.mark('Copying resources...');
  var filter = $.filter([paths.app + '/**/*.+(png|jpg|jpeg)'])
  return gulp.src([
      paths.app + '/**/*.*',
      '!' + paths.app + '/**/*.+(js|hbs|scss)',
    ])
    .pipe(gulp.dest(paths.dist))
    .pipe(environment !== 'production' ? browserSync.reload({stream: true}) : $.util.noop());
};
gulp.task('copy-resources', copyResources);

gulp.task('styles', function(){
  gulp.src([paths.app + '/**/*.scss'])
  .pipe($.sass({
  }).on('error', $.sass.logError))
  .pipe($.concatUtil('style.css'))
  .pipe($.rucksack({
    clearFix: true
  }))
  .pipe(gulp.dest(paths.dist + '/css'))
  .pipe(environment !== 'production' ? browserSync.reload({stream: true}) : $.util.noop());
});

gulp.task('img-min', function() {
  gulp.src(paths.app + '/img/*')
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dist));
})

var buildApp = function(){
  return gulp.src(paths.app + '/js/**/*.js')
    .pipe(environment === 'production' ? $.uglify() : $.util.noop())
    .pipe(gulp.dest(paths.dist + '/js'))
    .pipe(environment !== 'production' ? browserSync.reload({stream: true}) : $.util.noop());
};
gulp.task('build-app', buildApp);


var buildStyles = function() {
  return gulp.src([paths.app + '/**/*.scss'])
  .pipe($.sass({
    includePaths: [cssFramework, swipebox]
  }).on('error', $.sass.logError))
  .pipe($.concatUtil('style.css'))
  .pipe(environment === 'production' ? $.cssmin() : $.util.noop())
  .pipe(gulp.dest(paths.dist + '/css'))
  .pipe(environment !== 'production' ? browserSync.reload({stream: true}) : $.util.noop());
};
gulp.task('build-styles', buildStyles);

// gulp.task('serve', function() {
//   browserSync({
//     server: {
//       baseDir: paths.project
//     },
//     open: false
//   });
// });

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: paths.dist
    },
    open: false,
    ghostMode: false
  });
});

gulp.task('build', function(callback){
  runSequence('clean',
    [
      'copy-resources',
      'build-styles',
      'build-app'
    ],
    callback);
});


gulp.task('prod', function() {
  environment = 'production';
  gulp.start('build');
})


gulp.task('default', function(){
  environment = 'development';
    gulp.start('build', function() {
    gulp.watch(paths.app + '/**/*.scss', buildStyles);
    gulp.watch(paths.app + '/**/*.js', buildApp);
    gulp.watch([
      paths.app + '/**/*.*',
      '!' + paths.app + '/**/*.+(hbs|js|scss)',
    ], copyResources);
  });
  gulp.start('serve');
})