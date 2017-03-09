var panini;
var assign = require('lodash.assign');
var getConfig = require('flexiconfig');
var help = require('./lib/helpMessage');
var vfs = require('vinyl-fs');

/**
 * Initializes an instance of Panini.
 * @constructor
 * @param {object} options - Configuration options to use.
 */
function Panini(options) {
  this.options = assign({
    pages: 'pages',
    layouts: 'layouts',
    partials: 'partials',
    helpers: 'helpers',
    data: 'data',
    pageLayouts: {},
    builtins: true,
  }, options);
  this.Handlebars = require('handlebars');
  this.layouts = {};
  this.data = {};

  if (!this.options.input) {
    throw new Error('Must specify an input directory.');
  }

  if (this.options.builtins) {
    this.loadBuiltinHelpers();
  }
}

Panini.prototype.refresh = require('./lib/refresh');
Panini.prototype.loadLayouts = require('./lib/loadLayouts');
Panini.prototype.loadPartials = require('./lib/loadPartials');
Panini.prototype.loadHelpers = require('./lib/loadHelpers');
Panini.prototype.loadBuiltinHelpers = require('./lib/loadBuiltinHelpers');
Panini.prototype.loadData = require('./lib/loadData');
Panini.prototype.render = require('./lib/render');
Panini.prototype.getSourceStream = require('./lib/getSourceStream');

/**
 * Gulp stream function that renders HTML pages. The first time the function is invoked in the stream, a new instance of Panini is created with the given options.
 * @param {string} src - Base folder for project.
 * @param {object} options - Configuration options to pass to the new Panini instance.
 * @param {boolean} singleton - Return a new Panini instance instead of the cached one.
 * @returns {Object} Transform stream with rendered files.
 */
module.exports = function(src, opts, singleton) {
  if (!panini || singleton) {
    var options = getConfig(['package.json#panini', opts, {}]);
    options.input = src;
    var inst = new Panini(options);
    inst.loadBuiltinHelpers();
    inst.refresh();

    if (!singleton) {
      panini = inst;
      module.exports.refresh = inst.refresh.bind(inst);
    }
  }

  // Compile pages with the above helpers
  return inst.getSourceStream().pipe(inst.render());
}

module.exports.Panini = Panini;
module.exports.refresh = function() {}
module.exports.help = function() {
  help();
}
