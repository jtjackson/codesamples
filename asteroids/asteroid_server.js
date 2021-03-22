const http = require('http');
const https = require('https');
const url = require('url');

const api_key = "aM2ykssLX8pSZHxrcE8da2iqCWK4jLNC9aiyvtGd" //this is my api key. You may need to generate your own.

const hostname = 'localhost'; //running on a localhost server
const port = 8000;

const server = http.createServer();

server.on('request', (request, response) => {
    let body = [];
    let startDate = '';
    let endDate = '';
    let jsonBuff;

    request.on('data', chunk => {
        body.push(chunk);
      
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        var jsonBuff = JSON.parse(body);
        startDate = jsonBuff.dateStart; //start date
        endDate = jsonBuff.dateEnd; //end data
        const within_dist = jsonBuff.within.value; //the minimum distance required

        var path = "/neo/rest/v1/feed?start_date=" + startDate + "&end_date=" + endDate + "&api_key=" + api_key;

        const options = {
            hostname: "api.nasa.gov",
            path: path,
            method: 'GET'
        }

        let chunk_string = [];
        var asteroid_json = { "asteroids": [] };

        //sending a request to api.nasa.gov and then writing a response to the client based on data recieved by the nasa.gov server
        var httpreq = https.request(options, res => {
            res.on('data', chunk => {
                chunk_string.push(chunk);                
                
            }).on('end', () => {
                chunk_string = Buffer.concat(chunk_string).toString();
                asteroid_buff = JSON.parse(chunk_string);

                for (var key in asteroid_buff.near_earth_objects){
                    if (asteroid_buff.near_earth_objects.hasOwnProperty(key)){
                        var array1 = asteroid_buff.near_earth_objects[key];
                        for (var key1 in array1){
                            //calculating the distance based on the miles proeprty of miss_distance.
                            //if the value is less than or equal to the required distance, then 
                            //the asteroid is added to the array.
                            var dis = array1[key1].close_approach_data[0].miss_distance.miles;
                            
                            if (dis <= within_dist){
                                asteroid_json["asteroids"].push(array1[key1].name);
                            }
                        }
                    }
                }

                response.write(JSON.stringify(asteroid_json));

            }).on('error', () => {
                //sends an error JSON value.
                response.write(JSON.stringify({"error": true}));
            })
        });

        httpreq.end();

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');

    });

    request.on('error', err =>{
        console.err("error: " + err.stack);
    });

});

server.listen(port, hostname, () => {
    console.log("Server started!")
    console.log(`Server running at http://${hostname}:${port}/`);
})
