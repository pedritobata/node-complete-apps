/*
*
* Entry file for this API
*
*/

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer(function(req,res){
    const parsedUrl = url.parse(req.url, true);
    const trimmedUrl = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    const method = req.method;
    const queryObj = parsedUrl.query;
    const headers = req.headers;

    processRequest(req, res, function(buffer) {
        console.log('Streamed in:', buffer);
        // routing
        const chosenHandler = router[trimmedUrl] || handlers.notFound;
        const data = {
            trimmedUrl,
            queryObj,
            headers
        }
        chosenHandler(data, function(statusCode, payload) {
            console.log('status=> ', statusCode);
            const status = typeof statusCode === 'number' ? statusCode : 200;
            const payloadString = typeof payload === 'object' ? JSON.stringify(payload) : '{}'; 
            res.writeHead(status)
            res.end(payloadString);
        })
    });

    console.log('parsedUrl:', parsedUrl);
    console.log('trimmedUrl:', trimmedUrl);
    console.log('method:', method);
    console.log('query:', queryObj);
    console.log('headers:', headers);
});

function processRequest(req, res, onEnd) {
    let buffer = '';
    const decoder = new StringDecoder('utf-8');
    req.on('data', function(chunk) {
        console.log('chunk => ', chunk);
        buffer += decoder.write(chunk);
    });

    req.on('end', function() {
        buffer += decoder.end();
        onEnd(buffer);
    });
}

const handlers = {};

handlers.sample = function(data, callback) {
    callback(406, {name: 'perico'});
}

handlers.notFound = function(data, callback) {
    callback(404);
}

const router = {
    "sample": handlers.sample
}


server.listen(3000, function(){
    console.log('Server running on port 3000');
});