## Notes on API Gateway integration

In the Lambda console for the twilio function, you need to set your `TWILIO_AUTH_TOKEN` and `TWILIO_ACCOUNT_SID` up to yours for testing on your mobile number associated with your Twilio trial.
Leave `X_API_KEY` as is for making requests to the cards API.


Currently the following is what I've got set up in the dev stage of API Gateway only (i.e. it's not in prod).

Twilio posts using x-www-form-urlencoded data, the integration request body mapping needs to be set up as follows to pass that in as a string in the event as defined:
```
{
        "reqbody":"$input.path('$')"
}
```
i.e. the form data is then `event.reqbody` in the Lambda code, and then this string needs to be converted into an object using `querystring.parse()`, and you can then access the fields as per https://www.twilio.com/docs/api/twiml/sms/twilio_request in a programatic way.


In index.js:76 and then index.js:36 you can see we wrap the XML inside JSON to pass it back out through the API Gateway/Lambda integration.

A body template mapping needs to be set up in the integration response part of API Gateway as follows
```
#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
$errorMessageObj.message
```
in order to unpack that back into a text/xml response.

In method response, we set up a response body with text/xml as as the content type (model is left as empty model as we've already got text/xml at this point from the previous step).

At this point the API request from Twilio to our API endpoint is open, although if anyone else calls it then there's no SMS message sent. Twilio doesn't support API keys in HTTP headers, only [basic or digest](https://www.twilio.com/docs/api/security). To implement these you'd need to write another Lambda function to do the [custom authorization]( https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/). There's an example [here](https://github.com/elerch/basic-auth-api-gateway) of doing basic auth.
