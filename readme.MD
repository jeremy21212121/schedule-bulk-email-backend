# Bulk email backend server

handles scheduling of batch email campaigns. Takes the email, an array of recipients and the send time.

supports cancelling of scheduled campaigns. uses nodemailer for SMPTP support.

currently supports scheduling up to 24 days in advance with no persistence across server reboots.

the `/send` endpoint expects JSON in the following format:

```
{

# arbitrary boolean flag for no apparent reason
sendMails: true,

# unix timestamp for send time
unixTime: 1574657132852,

subject: "Subject of email",

recipients: [ "test@example.com", "test2@example.com" ],

htmlEmail: "<!doctype html><html><body><h1>hi again</h1></body></html>",

txtEmail: "hi again"

}
```

