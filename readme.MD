# Low volume bulk email API made with Nodemailer and Express

Handles scheduling of batch email campaigns. Takes the email, an array of recipients and the send time.

Supports cancelling of scheduled campaigns. Uses nodemailer for SMTP support.

MVP supports scheduling up to 24 days in advance with no persistence across server restarts.

The `/send` endpoint expects JSON in the following format:

```
{

unixTime: 1574657132852, // unix timestamp for send time

subject: "Subject of email",

recipients: [ "test@example.com", "test2@example.com" ],

htmlEmail: "<!doctype html><html><body><h1>hi again</h1></body></html>",

txtEmail: "hi again"

}
```

## run

```
npm run start
```

## test

```
npm run test
```

Currently just tests creating, listing and removing campaigns. Make sure to start the server before running the tests.
