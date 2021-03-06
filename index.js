var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {  
    res.send('This is Chatbot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {  
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hubw.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


// handler receiving messages
app.post('/webhook', function (req, res) {  
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {  
            var text = event.message.text;
            console.log(text);
            // getStarted(event.sender.id);

            if (text == 'Report'){
                sendMessage(event.sender.id, {text: "What would you like to report?"});
            }
            else if (text == 'Help'){
            	sendLocation(event.sender.id);
            } 
            else if (text == 'Status'){
                sendMessage(event.sender.id, {text: "Your report submitted on March 11th has been labelled as high priority."});
            }
            else {
            	sendMessage(event.sender.id, {text: "Your report has been submitted and is currently under review. While you wait you may find these resources helpful."});
                reportMessage(event.sender.id, text);
            }
           
        } else if (event.postback) {
            if (event.postback.payload == get_started){
                sendMessage(event.sender.id, {text: "Let's get started"});
            } else if(event.postback.payload == 'Call outfits function'){
                //message = {text: "Here are some outfits!"};
                //sendMessage(event.sender.id, message);
                outfitMessage(event.sender.id);
                //sendMessage(event.sender.id, {text: outfitMessage(event.sender.id)});
                console.log("Postback received: " + JSON.stringify(event.postback));
            } else if (event.postback.payload == 'Like'){
                sendMessage(event.sender.id, {text: "Come back anytime for more!"});
            }
        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {  
        request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


// send rich message 
function reportMessage(recipientId, text) {

    var city = text;

    		var webUrl1 = "http://www.loftcs.org/programs/the-access-point/";
            var imageUrl1 = "https://medschool.vanderbilt.edu/pcc/files/pcc/resize/public_files/Group1-400x300.jpg";
            var webUrl2 = "http://www.adamhouse.org/home";
            var imageUrl2 = "https://i0.wp.com/cdn.chrisd.ca/wp-content/uploads/2017/02/brian-pallister-1.jpg?w=650";

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "LOFT: The Access Point",
                            "subtitle": "A single point of access to mental health and addictions support services and supportive housing",
                            "image_url": imageUrl1,
                            "buttons": [{
                                "type": "web_url",
                                "url": webUrl1,
                                "title": "Visit Site"
                            }, {
                                "type": "web_url",
                                "url": webUrl1,
                                "title": "Visit WAO",
                                }],
                            }, {
                                "title": "Adam House",
                                "subtitle": "A home and caring community for newly arrived refugee claimants in Toronto.",
                                "image_url": imageUrl2 ,
                                "buttons": [{
                                "type": "web_url",
                                "url": webUrl2,
                                "title": "Visit Site"
                            }, {
                                "type": "web_url",
                                "url": webUrl2,
                                "title": "VisitWAO",
                                //MIGHT BE USEFUL LATER: "payload": "User " + recipientId + " likes us ",
                            }],
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
    // }

    // return false;

};

function sendLocation(recipientId)  {

    //text = text || "";
    //var values = text.split(' ');

        

            message = {
                "text":"Share your location:",
                "quick_replies":[
                  {
                    "content_type":"location",
                  }
                ]
              };

            sendMessage(recipientId, message);
            return true;

};