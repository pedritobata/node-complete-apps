/*
*
* Entry file for this API
*
*/

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const httpServer = http.createServer(unifiedServer);

const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

function unifiedServer(req,res){
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
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(status)
            res.end(payloadString);
        })
    });

   /*  console.log('parsedUrl:', parsedUrl);
    console.log('trimmedUrl:', trimmedUrl);
    console.log('method:', method);
    console.log('query:', queryObj);
    console.log('headers:', headers); */
}

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

handlers.ping = function(data, callback) {
    callback(200);
}

handlers.notFound = function(data, callback) {
    callback(404);
}

const router = {
    "ping": handlers.ping
}


httpServer.listen(config.httpPort, function(){
    console.log(`Server running on port ${config.httpPort} in ${config.envName} mode`);
});

httpsServer.listen(config.httpsPort, function(){
    console.log(`Server running on port ${config.httpsPort} in ${config.envName} mode`);
});