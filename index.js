var fs = require('fs');
var path = require('path');

var gulpUtil = require('gulp-util');
var through2 = require('through2');
var cheerio  = require('cheerio');
var _        = require('lodash');

// load the iconset template
var iconSetTemplatePath = path.join(__dirname, 'lib/iconset-template.html');
var iconSetTemplate     = fs.readFileSync(iconSetTemplatePath, 'utf8');
var renderIconSetHtml   = _.template(iconSetTemplate);

// default values for options
var DEFAULT_OPTIONS = {
    iconName: function (file) {
        return path.basename(file.path, '.svg');
    },
    iconSize: 24,
};

function polymerIconset(options) {

    // set default options
    options = options || {};
    _.defaults(options, DEFAULT_OPTIONS);

    // check for required options
    if (!options.iconSetName) {
        throw new gulpUtil.PluginError(
            'gulp-polymerize-svg',
            'iconSetName option is required'
        );
    }

    // start an empty icons string
    var iconsSvgString = '';

    function bufferContents(file, encoding, cb) {

        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }

        if (file.isBuffer()) {

            var stringFileContents = file.contents.toString(encoding);

            // retrieve the iconSvgString
            var $ = cheerio.load(stringFileContents, {
                xmlMode: true
            });

            var iconNode = $('svg > g');

            // give id to the iconNode
            var id = options.iconName(file);
            iconNode.attr('id', id);

            // add it to the full string
            iconsSvgString += '\n' + $.xml(iconNode);
        }

        if (file.isStream()) {
            throw new gulpUtil.PluginError('gulp-polymerize-svg', 'streams not currently supported');
        }

        // invoke callback and pass no files
        cb();
    }

    function endStream(cb) {

        // set the iconsSvgString onto options
        var renderOptions = _.assign({
            iconsSvgString: iconsSvgString,
        }, options);

        // render the template
        var iconSetHtml = renderIconSetHtml(renderOptions);

        // create the file object
        var file = new gulpUtil.File({
            path: options.iconSetName + '.html',
            contents: new Buffer(iconSetHtml),
        });

        // send the file downwards the stream
        this.push(file);

        cb();
    }

    return through2.obj(bufferContents, endStream);
}

module.exports = polymerIconset;
