var http  = require('http'),
    url   = require('url'),
    qs    = require('querystring'),
    Image = require('./image.js');

var dir = '/mnt/rob/Pictures/Wallpaper';
var cache = [];

http.createServer(function(req, res) {
  var urlParts = url.parse(req.url);

  if (urlParts.pathname === '/favicon.ico') {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('Not found');
    return res.end();
  }

  if (cache[req.url]) {
    res.writeHead(200, {'Content-Type': cache[req.url].type});
    cache[req.url].data.forEach(function(data) {
      res.write(data);
    });
    res.end();
  } else {
    var query = qs.parse(urlParts.query);
    var requestedFile = dir + urlParts.pathname;
    var img = new Image(requestedFile, query);
    var cacheBuffer = [];

    img.on('error', function(err) {
      console.log(err);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.write('Not found');
      return res.end();
    });

    img.on('data', function(chunk) {
      cacheBuffer.push(chunk);
    });

    img.on('end', function(type) {
      res.writeHead(200, {'Content-Type': type});
      cache[req.url] = {
        type: type,
        data: cacheBuffer
      };
      return res.end();
    });

    img.process(res);
  }
}).listen(3030);