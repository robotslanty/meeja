var gm           = require('gm'),
    fs           = require('fs'),
    mime         = require('mime'),
    _            = require('underscore')
    EventEmitter = require('events').EventEmitter;

function Image(file, options) {
  var defaults = {
    w: null,
    h: null,
    q: 100,
    o: 'scale'
  };

  this.file = file;
  this.options = _.extend(defaults, options);

  if (this.options.h && !this.options.w) {
    this.options.w = this.options.h;
  }

  if (this.options.w && !this.options.h) {
    this.options.h = this.options.w;
  }
}

Image.prototype.__proto__ = EventEmitter.prototype;

Image.prototype.process = function(outStream) {
  var self = this;
  console.log(self.file);
  var type = mime.lookup(self.file);

  if (type.match(/^image/)) {
    var inStream = fs.createReadStream(self.file);

    inStream.on('error', function(err) {
      self.emit('error', err);
    });

    img = gm(inStream);

    if (self.options.w && self.options.h) {
      switch(self.options.o) {
        case 'resize':
          img.resize(self.options.w, self.options.h, '!');
          break;

        case 'scale':
        default:
          img.scale(self.options.w, self.options.h);
          break;
      }
    }

    if (self.options.q) {
      img.quality(self.options.q);
    }

    img.stream(function _streamImage(err, out) {
      if (err) {
        self.emit('error', err);
      } else {
        out.pipe(outStream);

        out.on('data', function(chunk) {
          self.emit('data', chunk);
        });

        out.on('error', function(err) {
          self.emit('error', err);
        });

        out.on('end', function() {
          self.emit('end', type);
        });
      }
    });
  } else {
    self.emit('error', new Error('File is not an image'));
  }
};

module.exports = Image;