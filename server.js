var http    = require('http'),
    url     = require('url'),
    qs      = require('querystring'),
    Image   = require('./image.js'),
    Router  = require('barista').Router,
    connect = require('connect');

var port = 3030;

if (!process.argv[2]) {
  console.log('Missing directory');
  process.exit();
}

var app = connect()
.use(connect.static(__dirname + '/public'))
.use(handleImage)
.listen(port);

var imgRoot = process.argv[2];
imgRoot = (imgRoot.lastIndexOf('/') !== imgRoot.length - 1) ? imgRoot : imgRoot.substr(imgRoot.length - 1);
var cache = [];

function handleImage(req, res) {
  req.urlParts = url.parse(req.url);

  if (req.urlParts.pathname === '/favicon.ico') {
    return handleError(req, res, 404);
  }

  if (cache[req.url]) {
    res.writeHead(200, {'Content-Type': cache[req.url].type});
    cache[req.url].data.forEach(function(data) {
      res.write(data);
    });
    res.end();
  } else {
    var query = qs.parse(req.urlParts.query);
    var requestedFile = imgRoot + req.urlParts.pathname;
    var img = new Image(requestedFile, query);
    var cacheBuffer = [];

    img.on('error', function(err) {
      return handleError(req, res, 404, err);
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
}

function handleError(req, res, status, err) {
  if (err) {
    console.log(err);
  }

  res.writeHead(status, {'Content-Type': 'text/html'});

  switch (status) {
    case 500:
      res.write('Server Error');
      break;
    case 404:
    default:
      res.write('Not Found');
      break;
  }
  
  return res.end();
}