var http = require('http'),
    request = require('request'),
    express = require('express'),
    twilio = require('twilio');

require('dotenv').config({silent:true});

var app = express();

var options = {
  host: 'https://data-dev.petabencana.id',
  path: '/cards',
  method: 'POST',
  port: 80,
  headers: {
    'x-api-key': process.env.X_API_KEY,
    'Content-Type': 'application/json'
  }
}

app.post('/sms', function(req, res){
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();

  // Get a card from our server (nested request)
  var card_request = {
    "username": "twilio",
    "network":"sms",
    "language":"id"
  }

  request({
    url: options.host+options.path,
    method: options.method,
    headers: options.headers,
    port: options.port,
    json: true,
    body: card_request
  }, function(error, response, body){
    // TODO - error handling (if !err & response.code === 200)...
    // Now respond to Twilio
    // prepare Twilio reply
    twiml.message(function(){
      this.body('Hi! I am Bencana Bot. Please send me your flood report using this link https://dev.petabencana.id/cards/'+body.cardId);
    });
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  })
});

http.createServer(app).listen(1337, function(){
  console.log("Express server listening on port 1337");
});
