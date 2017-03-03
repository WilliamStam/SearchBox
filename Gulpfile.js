var jsfile = [
	'./src/js/functions.js',
	'./src/js/plugin.js'
];


var styleFiles = [
	{
		'file': './src/scss/base.scss',
		'path': './dist',
		'filename': 'jquery.searchbox.css',
	}

];


var javascriptFiles = [
	{
		'files': jsfile,
		'path': './dist',
		'filename': 'jquery.searchbox.js'
	}
]


const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const merge = require('merge-stream');
var gitCommitMessage = false;


var build = false;

const gulp = require('gulp');
require("time-require");

const duration = require('gulp-duration');



gulp.task('sass', function (done) {


	if (process.argv.indexOf("--build") != -1) build = true;
	if (process.argv.indexOf("-b") != -1) build = true;


	if (build) {
		var autoprefixer = (typeof autoprefixer !== 'undefined') ? autoprefixer : require('gulp-autoprefixer');
		var cleanCss = (typeof cleanCss !== 'undefined') ? cleanCss : require('gulp-clean-css');
		var sourcemaps = (typeof sourcemaps !== 'undefined') ? sourcemaps : require('gulp-sourcemaps');
		var fs = (typeof fs !== 'undefined') ? fs : require('fs');
		var headerComment = (typeof headerComment !== 'undefined') ? headerComment : require('gulp-header-comment');

	}

	var tasks = styleFiles.map(function (element) {

		var timer = duration(element.path + "/" + element.filename);
		if (build) {
			return gulp.src(element.file)
			//
				.pipe(sass({
					outputStyle: 'expanded',
					includePaths: ['./']
				}))
				.pipe(concat(element.filename, {newLine: ';'}))
				.pipe(headerComment(fs.readFileSync('LICENCE-MIT', 'utf8'), {  } ))
				.pipe(gulp.dest(element.path))
				.pipe(autoprefixer({
					browsers: ['last 2 versions'],
					cascade: false
				}))
				.pipe(gulp.dest(element.path))
				.pipe(rename({ suffix: '.min' }))
				.pipe(sourcemaps.init())
				.pipe(cleanCss({
					inline: ['local'],
					rebaseTo: "./",
					specialComments: false,
					//processImport: false,
				}))
				.pipe(sourcemaps.write("."))
				.pipe(timer)

				.pipe(gulp.dest(element.path))
		} else {
			return gulp.src(element.file)
				.pipe(sass({
					outputStyle: 'expanded',
					includePaths: ['./']
				}))
				.pipe(concat(element.filename, {newLine: ';'}))
				.pipe(timer)
				.pipe(gulp.dest(element.path))
		}
	});
	return merge(tasks);

});


gulp.task('javascript', function (done) {

	if (process.argv.indexOf("--build") != -1) build = true;
	if (process.argv.indexOf("-b") != -1) build = true;

	if (build) {
		var sourcemaps = (typeof sourcemaps !== 'undefined') ? sourcemaps : require('gulp-sourcemaps');
		var uglify = (typeof uglify !== 'undefined') ? uglify : require('gulp-uglify');
		var fs = (typeof fs !== 'undefined') ? fs : require('fs');
		var headerComment = (typeof headerComment !== 'undefined') ? headerComment : require('gulp-header-comment');
	}

	var uglify_options = {
		preserveComments: 'license',
		compress:true,

	};


	//build = false;
	var tasks = javascriptFiles.map(function (element) {

		var timer = duration(element.path + "/" + element.filename);
		if (build) {
			return gulp.src(element.files)

				.pipe(concat(element.filename, {newLine: ';'}))
				.pipe(headerComment(fs.readFileSync('LICENCE-MIT', 'utf8'), {  } ))
				.pipe(rename(element.filename))
				.pipe(gulp.dest(element.path))
				.pipe(sourcemaps.init())
				.pipe(uglify(uglify_options))
				.pipe(rename({ suffix: '.min' }))
				.pipe(sourcemaps.write("."))


				.pipe(timer)
				.pipe(gulp.dest(element.path));
		} else {
			return gulp.src(element.files)
				.pipe(concat(element.filename, {newLine: ';'}))
				.pipe(rename(element.filename))
				.pipe(timer)
				.pipe(gulp.dest(element.path));
		}
	});
	return merge(tasks);
});
gulp.task('cleanMaps', function () {

});

gulp.task('js', gulp.parallel('javascript'));
gulp.task('css', gulp.parallel('sass'));


gulp.task('set-build', function (done) {
	build = true;
	if (process.argv.indexOf("--dev") != -1 || process.argv.indexOf("-d") != -1) {
		build = false;
	}
	done();
});

gulp.task('build', gulp.series('set-build', gulp.parallel(['sass', 'javascript']), function (done) {
	done();
}));


gulp.task("composer-update", function (done) {
	var composer = require("gulp-composer");
	composer("self-update", {"self-install": false, "working-dir": './'});
	composer("update", {"self-install": false, "working-dir": './'});
	done();
});


gulp.task('git-commit', function (done) {
	gitCommitMessage = (typeof gitCommitMessage !== 'undefined' && gitCommitMessage != "") ? gitCommitMessage : "gulp commit";

	var d = new Date();
	var prefix = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);


	gitCommitMessage = prefix + "\n" + gitCommitMessage;

	git = (typeof git !== 'undefined') ? git : require('gulp-git');

	var timer = duration('git-commit');
	return gulp.src('./')
		.pipe(git.commit(gitCommitMessage))
		.pipe(timer);


});
gulp.task('git-push', function (done) {


	git = (typeof git !== 'undefined') ? git : require('gulp-git');

	git.push('remote', 'master', function (err) {
		if (err) {
			throw err;
		} else {
			done();
		}
	});


});
gulp.task('git-diff', function (done) {


	git = (typeof git !== 'undefined') ? git : require('gulp-git');

	git.exec({args: ' diff --stat'}, function (err, stdout) {
		gitCommitMessage = stdout
		if (err) throw err;
		done();
	});


});


gulp.task('update', gulp.series('composer-update', function (done) {
	done();
}));

gulp.task('deploy', gulp.series('build', function (done) {
	done();
}));
/*
gulp.task('deploy', gulp.series('build', 'git-diff', 'git-commit', 'git-push', function (done) {
	done();
}));
*/
