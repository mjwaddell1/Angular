const http  = require('http');
const https = require('https');
const url = require('url');

//curl "http://localhost:8080/?site=https://query1.finance.yahoo.com/v7/finance/chart/DIA?range=1mo%26interval=1d%26indicators=quote%26includeTimestamps=true"

let port=8080;

console.log(process.argv);
if (process.argv.length > 2) port = process.argv[2];

console.log('Starting...');

//create a server object:
http.createServer(function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");  //prevent CORS error
  doGet(req, res);
  //res.end(); //end the response
}).listen(port);

console.log('Listening on port '+port+'...');


function doGet(req, res)
{
  try
  {
    const queryObject = url.parse(req.url,true).query;
    let site = queryObject['site'];
    console.log(site);
    let h = (site.startsWith('https')) ? https : http;
    
    h.get(site, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Send the result.
      resp.on('end', () => {
        console.log(data);
        res.write(data);
        res.end();
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
  catch(err) { 
     console.log(err.message); 
     res.write(err.message);
     res.end(); 
  }
}
