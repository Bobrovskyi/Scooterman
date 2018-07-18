'use strict';

const gulp         = require('gulp');
const pug          = require('gulp-pug');
const sass         = require('gulp-sass');
const cache        = require('gulp-cache');
const rename       = require("gulp-rename");
const rimraf       = require('rimraf');
const cssnano      = require('gulp-cssnano');
const imagemin     = require('gulp-imagemin');
const pngquant     = require('imagemin-pngquant');
const svgSprite    = require('gulp-svg-sprite');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync  = require('browser-sync').create();

// ----- SERVER -----

gulp.task('server', function() {
    browserSync.init({
        server: {
        	port: 9000,
         	baseDir: "build"
        }
    });

    gulp.watch('build/**/*.*').on('change', browserSync.reload);
});

// ----- PUG -----

gulp.task('templates:compile', function() {
  return gulp.src([
    '_dev/templates/index.pug'
    // '_dev/templates/category.pug',
    // '_dev/templates/product.pug',
    // '_dev/templates/blog.pug',
    // '_dev/templates/blog-post.pug',
    // '_dev/templates/authentication.pug',
    // '_dev/templates/password-recovery.pug',
    // '_dev/templates/cms.pug',
    // '_dev/templates/products-comparison.pug'
  ])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('build'));
});

// ----- SASS -----

gulp.task('styles:compile', function () {
	return gulp.src('_dev/sass/main.scss')
	// .pipe(sourcemaps.init())
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
	.pipe(cssnano())
	.pipe(rename('main.min.css'))
	// .pipe(sourcemaps.write())
	.pipe(gulp.dest('build/css'));
})

// ----- COPY IMAGES -----

gulp.task('images:copy', function() {
	return gulp.src('_dev/img/*.{jpg,png,svg}', {since: gulp.lastRun('images:copy')})
	.pipe(cache(imagemin({
	    interlaced: true,
	    progressive: true,
	    optimizationLevel: 1,
	    svgoPlugins: [{removeViewBox: true}],
	    use: [pngquant()]
	})))
	.pipe(gulp.dest('build/img'));
});

// ----- SVG SPRITE -----

gulp.task('svg:sprite', function() {
	return gulp.src('_dev/img/icons/*.svg')
	.pipe(cache(imagemin({
	    interlaced: true,
	    progressive: true,
	    optimizationLevel: 3,
	    svgoPlugins: [{removeViewBox: true}],
	    use: [pngquant()]
	})))
	.pipe(svgSprite({
		mode: {
		  css: {
		  	dest: '.',
		  	sprite: 'sprite.svg',
		  	layout: 'vertical',
		  	prefix: 'icon',
		  	dimensions: true,
		    render: {
		      css: true // Activate CSS output (with default options)
		    }
		  }
		}
	}))
	.pipe(gulp.dest('build/img'));
});

// ----- CLEAN -----

gulp.task('clean', function del(cb) {
	return rimraf('build', cb);
});

// ----- WATCHERS -----

gulp.task('watch', function() {
	gulp.watch('_dev/templates/**/*.*', gulp.series('templates:compile'));
	gulp.watch('_dev/sass/**/*.*', gulp.series('styles:compile'));
	gulp.watch('_dev/img/**/*.{jpg,png}', gulp.series('images:copy'));
});

// ----- BUILD -----

gulp.task('build', gulp.series('clean', gulp.parallel('templates:compile', 'styles:compile', 'images:copy', 'svg:sprite')));

// ----- DEFAULT -----

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));