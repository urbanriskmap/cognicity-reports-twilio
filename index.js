/* CogniCity Reports Twilio
 * Prototype SMS connectivity via Twilio service for GRASP links
 * Tomas Holderness, MIT 2017
*/

// Libs
var http = require('http'),
    request = require('request'),
    express = require('express'),
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

  // Get a card from our server
  // TODO extract Twilio metadata to log cell number against username
  var card_request = {
    "username": "twilio",
    "network":"sms",
    "language":"id"
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
    // TODO - error handling (if !err & response.code === 200)...
    // Now respond to Twilio
    // prepare Twilio reply
    twiml.message(function(){
      this.body('Hi! I am Bencana Bot. Please send me your flood report using this link https://dev.petabencana.id/cards/'+body.cardId);
    });
    return done({message: JSON.stringify(twiml.toString())},200);
  })
});
