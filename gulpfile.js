/* eslint-disable */
const gulp = require('gulp'),
  del = require('del'),
  browserSync = require('browser-sync').create(),
  injectPartials = require('gulp-inject-partials'),
  concat = require('gulp-concat'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  csso = require('gulp-csso'),
  webpack = require('webpack-stream'),
  rucksack = require('rucksack-css'),
  order = require('gulp-order'),
  svgmin = require('gulp-svgmin'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename');
var compress = require('compression');
const webp = require('gulp-webp');

// https://www.npmjs.com/package/gulp-css-replace-url

const src_folder = './src/';
const dist_folder = './dist/';
const aura_folder_css = '../../delivery.gr/web/delivery.gr/static/dev2.css/';
const aura_folder_js = '../../delivery.gr/web/delivery.gr/static/dev2.js/';
const aura_folder_imgs = '../../delivery.gr/web/delivery.gr/static/img2/';

//==================================
// CLEAN TASK
//==================================
gulp.task('clean', () => del([dist_folder]));

//==================================
// POSTCSS / CSS  TASK
//==================================
sass.compiler = require('node-sass');

gulp.task('css-dev', (done) => {
  return (
    gulp
      .src([src_folder + 'css/entry.scss'])
      .pipe(
        sass({
          includePaths: ['node_modules'],
        }).on('error', sass.logError),
      )
      .pipe(postcss([autoprefixer, rucksack]))
      .on('error', function (error) {
        console.log(error.toString().substring(0, 3000));
        done();
      })
      .pipe(csso())
      .pipe(rename('styles.css'))
      .pipe(gulp.dest(dist_folder + 'css'))
      // .pipe(gulp.dest(aura_folder_css))
      .pipe(browserSync.stream())
  );
});
gulp.task('validate-css', (done) => {
  done();
});
gulp.task('css', gulp.series('css-dev', 'validate-css'));

//==================================
// HTML TASKS
//==================================
gulp.task('html-dev', (done) => {
  return gulp
    .src([src_folder + 'html/pages/**/*.html'])
    .pipe(
      injectPartials({
        removeTags: true,
      }),
    )
    .on('error', function (error) {
      console.log(error);
      done();
    })
    .pipe(gulp.dest(dist_folder))
    .pipe(browserSync.stream());
});
gulp.task('validate-html', (done) => {
  done();
});
gulp.task('html', gulp.series('html-dev', 'validate-html'));

//==================================
// JAVASCRIPT TASKS
//==================================
gulp.task('js-vendor', (done) => {
  return gulp
    .src([src_folder + 'js/vendor/**/*'])
    .pipe(gulp.dest(dist_folder + 'js/'))
    .on('error', function (error) {
      console.log(error);
      done();
    });
});

gulp.task('js-dev', (done) => {
  return (
    gulp
      .src(src_folder + 'js/main.js')
      .pipe(webpack(require('./webpack.config.js')))
      .on('error', function (error) {
        console.log(error);
        done();
      })
      .pipe(gulp.dest(dist_folder + 'js/'))
      // .pipe(gulp.dest(aura_folder_js + '/'))
      .pipe(browserSync.stream())
  );
});

gulp.task('js-dev-delivery', (done) => {
  return gulp
    .src(src_folder + 'js/main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .on('error', function (error) {
      console.log(error);
      done();
    })
    .pipe(gulp.dest(dist_folder + 'js/'))
    .pipe(gulp.dest(aura_folder_js + '/'))
    .pipe(browserSync.stream());
});

gulp.task('js-release', (done) => {
  return (
    gulp
      .src(src_folder + 'js/main.js')
      .pipe(webpack(require('./webpack.config.build.js')))
      .on('error', function (error) {
        console.log(error);
        done();
      })
      .pipe(gulp.dest(dist_folder + 'js/'))
      // .pipe(gulp.dest(aura_folder_js + '/'))
      .pipe(browserSync.stream())
  );
});

gulp.task('js-dev-prod-delivery', (done) => {
  return gulp
    .src(src_folder + 'js/main.js')
    .pipe(webpack(require('./webpack.config.build.js')))
    .on('error', function (error) {
      console.log(error);
      done();
    })
    .pipe(gulp.dest(dist_folder + 'js/'))
    .pipe(gulp.dest(aura_folder_js + '/'))
    .pipe(browserSync.stream());
});

gulp.task('js', gulp.series('js-dev', 'js-vendor'));
gulp.task('js-del', gulp.series('js-dev-delivery', 'js-vendor'));
gulp.task('js-prod-del', gulp.series('js-dev-prod-delivery', 'js-vendor'));

//==================================
// IMAGES TASK
//==================================
gulp.task('imagesRaster', () => {
  return (
    gulp
      .src([src_folder + 'images/**/*.+(png|jpg|jpeg|gif|ico)'])
      .pipe(
        webp({
          quality: 100,
          // lossless: true,
        }),
      )
      .pipe(gulp.dest(dist_folder + 'images'))
      // .pipe(gulp.dest(aura_folder_imgs))
      .pipe(browserSync.stream())
  );
});

gulp.task('imagesVector', () => {
  return (
    gulp
      .src([src_folder + 'images/**/*.+(svg)'])
      .pipe(svgmin())
      .pipe(gulp.dest(dist_folder + 'images'))
      // .pipe(gulp.dest(aura_folder_imgs))
      .pipe(browserSync.stream())
  );
});

gulp.task('images', gulp.series('imagesRaster', 'imagesVector'));

//==================================
// FONTS (fontawesome)
//==================================
gulp.task('fonts', () => {
  return gulp
    .src(src_folder + 'fonts/**/*')
    .pipe(gulp.dest(dist_folder + 'fonts'))
    .pipe(browserSync.stream());
});
//==================================
// ASSETS
//==================================
gulp.task('assets', () => {
  return gulp
    .src(src_folder + 'assets/**/*')
    .pipe(gulp.dest(dist_folder + 'assets'))
    .pipe(browserSync.stream());
});

//==================================
// BROWSER SYNC
//==================================
gulp.task('serve', () => {
  return browserSync.init({
    server: {
      baseDir: ['dist'],
    },
    port: 3000,
    open: false,
    notify: false,
    middleware: [compress()],
  });
});

//==================================
// WATCH TASKS
//==================================
gulp.task('watch', () => {
  let a = gulp.watch(
    [src_folder + 'html/**/*.html', src_folder + 'html/**/*.hbs'],
    gulp.series('html'),
  );
  gulp.watch(src_folder + 'css/**/*.scss', gulp.series('css'));
  gulp.watch(src_folder + 'js/**/*.js', gulp.series('js'));
  gulp.watch(src_folder + 'images/**/*', gulp.series('images'));
  gulp.watch(src_folder + 'fonts/**/*', gulp.series('fonts'));
});

gulp.task(
  'build',
  gulp.series('clean', 'css', 'html', 'js', 'images', 'fonts', 'assets'),
);
gulp.task('dev-build', gulp.series('build', gulp.parallel('serve', 'watch')));

gulp.task('dev', gulp.parallel('serve', 'watch'));

gulp.task('build-js', gulp.series('js-del'));
gulp.task('build-prod-js', gulp.series('js-prod-del'));
