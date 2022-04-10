/*
*
* Entry file for this API
*
*/

const http = require('http');
const url = require('url');

const server = http.createServer(function(req,res){
    const parsedUrl = url.parse(req.url, true);
    const trimmedUrl = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    res.end('Server response: OK');

    console.log('parsedUrl:', parsedUrl);
    console.log('trimmedUrl:', trimmedUrl);
});


server.listen(3000, function(){
    console.log('Server running on port 3000');
});