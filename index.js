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
    /**
     * Name to be given to the icon
     * @param  {Vinyl} file
     * @return {String}     the id of the icon
     */
    iconId: function (file) {
        return path.basename(file.path, '.svg');
    },

    /**
     * Size
     * @type {Number}
     */
    iconSize: 24,

    // path
    ironIconsetSvgPath: '../iron-iconset-svg/iron-iconset-svg.html',
};

function polymerIconset(options) {

    // set default options
    options = options || {};
    _.defaults(options, DEFAULT_OPTIONS);

    // check for required options
    if (!options.iconsetName) {
        throw new gulpUtil.PluginError(
            'gulp-polymer-iconset',
            'iconsetName option is required'
        );
    }

    // start an empty icons string
    var iconsSvgString = '';

    function bufferContents(file, encoding, cb) {

        // evaluate options according to file
        var iconId = (typeof options.iconId === 'function') ? 
            options.iconId(file) : options.iconId;
        var iconSelector = (typeof options.iconSelector === 'function') ? 
            options.iconSelector(file) : options.iconSelector;

        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }

        if (file.isBuffer()) {
            // var to hold the icon svg string
            var svgStr = '\n<!-- ' + iconId + ' -->\n';

            // build a cheerio dom
            var $ = cheerio.load(file.contents.toString(encoding), {
                xmlMode: true
            });

            // find the svg node
            var svgNode = $('svg');

            // check if the icon is made of multiple nodes
            var svgNodeContents = svgNode.children();

            if (svgNodeContents.length === 1 && $(svgNodeContents[0]).is('g')) {
                // the icon is ready to be added to the iconset file

                // give id to the iconNode
                $(svgNodeContents[0]).attr('id', iconId);

                svgStr += $.xml(svgNodeContents[0]);
            } else {
                // the icon is not ready to be added,
                // we must wrap it with an 'g' (group) tag
                // before adding

                svgStr += '<g id="' + iconId + '">\n' + $.xml(svgNodeContents) + '\n</g>';
            }

            // add finishing comment
            svgStr += '\n<!-- ' + iconId + ' -->\n'

            // add it to the full iconset icons string
            iconsSvgString += svgStr;
        }

        if (file.isStream()) {
            throw new gulpUtil.PluginError(
                'gulp-polymer-iconset',
                'streams not currently supported'
            );
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
            path: options.iconsetName + '.html',
            contents: new Buffer(iconSetHtml),
        });

        // send the file downwards the stream
        this.push(file);

        cb();
    }

    return through2.obj(bufferContents, endStream);
}

module.exports = polymerIconset;
