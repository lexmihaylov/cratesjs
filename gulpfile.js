var gulp = require('gulp');
var rename = require('gulp-rename');
var inlineSrc = require('gulp-inline');
var uglify = require('gulp-uglify');
var uglifyInline = require('gulp-uglify-inline');
var shell = require('gulp-shell');
var path = require('path');

gulp.task('default', [
    'build-docs',
    'build-js',
    'build-html'
]);

gulp.task('build-js', function() {
    return gulp.src('./crates.js').
        pipe(uglify()).
        pipe(rename('crates.min.js')).
        pipe(gulp.dest('./'));
});

gulp.task('build-html', function() {
    return gulp.src('./crates.include.html').
        pipe(inlineSrc()).
        pipe(uglifyInline()).
        pipe(rename('crates.html')).
        pipe(gulp.dest('./'));
});
console.log(path.join('node_modules', '.bin', 'jsdoc2md'));
gulp.task('build-docs', shell.task([
    path.join('node_modules', '.bin', 'jsdoc2md') +
    ' -t '+
    path.join('doctpls', 'overview.hbs') +
    ' crates.js > README.md'
]));
