const http = require('http');

var postData = JSON.stringify({"dateStart":"2019-01-01","dateEnd":"2019-01-07","within":{"value":9000000,"units":"miles"}});

var options = {
    hostname: 'localhost',
    port: 8000,
    path: '/get_asteroid_data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Context-Length': postData.length
    }
}

var req = new http.ClientRequest(options,(res) => {
    res.setEncoding('utf8');

    res.on('data', chunk => {
        console.log('Asteroids within the required distance: ' + chunk);
        process.exit();
    }); 

});

req.on('error', e => {
    console.error('The error here is: ' + e);
});

req.write(postData);
req.end();

