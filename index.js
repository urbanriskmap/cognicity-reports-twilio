/* CogniCity Reports Twilio
 * Prototype SMS connectivity via Twilio service for GRASP links
 * Tomas Holderness, & Matthew Berryman MIT 2017
*/

// Libs
var request = require('request'),
    express = require('express'),
    querystring = require('querystring'),
    AWS = require('aws-sdk'),
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
  var sns = new AWS.SNS();

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

  var paramsWithValue = querystring.parse(event.reqbody); // Convert x-www-form-urlencoded form with data as per https://www.twilio.com/docs/api/twiml/sms/twilio_request into an object.
  // Note ".reqbody" is the key name specified in the integration request in API GW (see README.md).
  var fromNumber = paramsWithValue.From; // Sender's mobile number as a string, incl. + at front.

  var card_request = {
    "username": fromNumber,
    "network":"sms",
    "language":process.env.DEFAULT_LANG
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
      var cardPath = "petabencana.id/cards/";
      if (process.env.STAGE) {
        cardPath = process.env.STAGE + "." + cardPath;
      }
      twiml.message(function(){
        this.body('Hi! I am Bencana Bot. Please send me your flood report using this link https://'+ cardPath + body.cardId);
      });
    }
    else {
      twiml.message(function(){
        this.body('Hi! There was a problem handling your report, please try again later.')
      });

      console.log("Error with card request: "+ error);
      sns.publish({
          Message: "Error with card request: "+ error,
          TopicArn: process.env.SNS_TOPIC,
      }, function(err, data) {
          if (err) {
              console.log(err.stack);
              return;
          }
      });
    }
    return done({message: twiml.toString()},200);
  })
};
