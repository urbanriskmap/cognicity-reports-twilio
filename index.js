/* CogniCity Reports Twilio
 * Prototype SMS connectivity via Twilio service for GRASP links
 * Tomas Holderness, & Matthew Berryman MIT 2017
*/

// Libs
var http = require('http'),
    request = require('request'),
    express = require('express'),
    querystring = require('querystring'),
    twilio = require('twilio');

// Config
require('dotenv').config({silent:true});

var app = express();

// Post options to our cards service
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

// This app's endpoint (entered into Twilio console)
exports.handler = (event, context, callback) => {
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();

  // Helper function to format the response
  const done = (err, statusCode, res) => callback(err ? JSON.stringify({
    statusCode: statusCode,
    message: err.message
  }): null,
  {
    statusCode: statusCode,
    result: res
  });

  console.log(event); // log event.

  // Get a card from our server
  // TODO extract Twilio metadata to log cell number against username
  // @talltom: cell number? You're speaking American already? ;)

  var paramsWithValue = querystring.parse(event.reqbody); // Convert x-www-form-urlencoded form with data as per https://www.twilio.com/docs/api/twiml/sms/twilio_request into an object.
  // Note ".reqbody" is the key name specified in the integration request in API GW (see README.md).
  var fromNumber = paramsWithValue.From; // Sender's mobile number as a string, incl. + at front.

  var card_request = {
    "username": fromNumber,
    "network":"sms",
    "language":process.env.DEFAULT_LANG // Default language hard coded (TODO - move to .env)
  }
 // Make the request
  request({
    url: options.host+options.path,
    method: options.method,
    headers: options.headers,
    port: options.port,
    json: true,
    body: card_request
  }, function(error, response, body){
    if (!error && response.statusCode === 200){
      // Now respond to Twilio
      twiml.message(function(){
        this.body('Hi! I am Bencana Bot. Please send me your flood report using this link '+ process.env.CARD_PATH + body.cardId);
      });
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    else {
      console.log("Error with card request: "+ error);
    }

    return done({message: twiml.toString()},200);
  })
};
