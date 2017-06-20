# Gulp polimerize css
Gulp plugin that generates an `<iron-iconset-svg>` given a group of .svg icon files.

## Usage

Install it with npm

    npm install gulp-polymer-iconset

In your <code>gulpfile.js</code>:

```javascript
var gulp = require('gulp'),
    polymerIconset = require('gulp-polymer-iconset'),
    path = require('path');

gulp.task('styles', function(){
  return gulp.src('app/icons/**/*')
    .pipe(polymerIconset({
        iconSetName: 'my-icons',
        iconSize: 18,
        iconId: function (file) {
            return path.basename(file.path, '.svg');
        },
    }))
    .pipe(gulp.dest('app/iconsets'));
});
```

It results in:
```html
<link rel="import" href="../iron-icon/iron-icon.html">
<link rel="import" href="../iron-iconset-svg/iron-iconset-svg.html">

<iron-iconset-svg name="my-icons" size="18">
  <svg>
    <defs>

<!-- my-icons:icon-01 -->
<g id="my-icons:icon-01">
  <polygon points="..."/>
  <path d="..."/>
</g>
<!-- my-icons:icon-01 -->

<!-- my-icons:icon-02 -->
<g id="my-icons:icon-02">
  <path d="..."/>
</g>

    </defs>
  </svg>
</iron-iconset-svg>
```

## Options
* _iconSetName_ (String)
* _iconSize_ (String)
* _iconId_ (String|Function): if function, takes the file corresponding to the icon, and should return a String
