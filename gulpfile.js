const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');


// Load plugins
const uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    ignore = require('gulp-ignore'),
    changed = require('gulp-changed'),
    browsersync = require('browser-sync').create();

const $ = {
    path: {
        dest: {
            default: './public',
            assets: {
                default: './public/assets',
                js: './public/assets/js',
                css: './public/assets/css',
                fonts: './public/assets/fonts',
            },
            excludeClear: ['!./public/assets/img'],
        },
        src: {
            scss: './src/scss',
            js: './src/js',
            fonts: './src/fonts',
        }
    }
};


// Clean assets
function clear() {
    return src(`${$.path.dest.default}*`, {
            read: false
        })
        .pipe(ignore(`${$.path.dest.excludeClear}`))
        .pipe(clean());
}

// JS function 
function js() {
    const source = `${$.path.src.js}/**/*.js`;

    return src(source)
        .pipe(changed(source))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(`${$.path.dest.assets.js}`))
        .pipe(browsersync.stream());
}

// CSS function 
function scss() {
    const source = `${$.path.src.scss}/main.scss`;
    return src(source)
        .pipe(changed(source))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(cssnano())
        .pipe(dest(`${$.path.dest.assets.css}`))
        .pipe(browsersync.stream());
}

// Fonts function 
function fonts() {
    const source = `${$.path.src.fonts}/**/*`;

    return src(source)
        .pipe(dest(`${$.path.dest.assets.fonts}`))
        .pipe(browsersync.stream());
}


// Watch files
function watchFiles() {
    watch(`${$.path.src.fonts}/*`, fonts);
    watch(`${$.path.src.scss}/**/*.scss`, scss);
    watch(`${$.path.src.js}/**/*.js`, js);
    watch(`${$.path.dest.default}/*.html`, browserSyncReload);
}


//Live reload connect
function browsersyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: `${$.path.dest.default}/`
        }
    });
    cb();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Tasks to define the execution of the functions simultaneously or in series
exports.watch = parallel(watchFiles, browsersyncServe);
exports.default = series(clear, parallel(js, scss));