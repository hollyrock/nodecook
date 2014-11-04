var http = require('http');
var path = require('path');
var fs = require('fs');

var cache = {};

var mimeTypes = {
	'.js' : 'text/javascript',
	'.html' : 'text/html',
	'.css' : 'text/css'
};

function cacheAndDeliver(f, cb){
	fs.stat(f, function(err, stats){
		if(err) {return console.log('Oh no!, Eror', err);}
		var lastChanged = Date.parse(stats.ctime),
		isUpdated = (cache[f]) && lastChanged > cache[f].timestamp;
		if(!cache[f] || isUpdated){
			fs.readFile(f, function(err, data){
				if(!err){
					cache[f] = {content: data, timestamp: Date.now()};
					console.log('loading ' + f + ' from file');
				}
				cb(err, data);
			});
			return;
		}
		console.log('loading ' + f + ' from cache');
		cb(null, cache[f].content);
	});
}

http.createServer(function(request, response){
	var lookup = path.basename(decodeURI(request.url))||'index.html';
	var f = 'content/' + lookup;
	fs.exists(f, function(exists){
		if(exists){
			cacheAndDeliver(f, function(err, data){
				if(err) {
					response.writeHead(500);
					response.end('Server Error!');
					return;
				}
				var headers = {'content-type': mimeTypes[path.extname(f)]};
				response.writeHead(200, headers);
				response.end(data);
			});
			return;
		}
		response.writeHead(404);
		response.end('Page Not Found');
	});
}).listen(8080);

