var gulp = require('gulp');
// var changed = require('gulp-changed');
var MemoryFS = require('anyfs.memory');

gulp.task('copy', function() {
    var fs = new MemoryFS();
    return gulp.src('src/*')
        .pipe(fs.dest('/'))
        .pipe(gulp.dest('tmp/dest/'));
});