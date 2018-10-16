const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./path/to/key.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://processing-allotments.firebaseio.com"
});

// for contacting the sendinblue API
var request = require("request");

var options = { 
    method: 'POST',
    url: 'https://api.sendinblue.com/v3/emailCampaigns/1/sendTest',
    body: { emailTo: [] },
    headers: {
        'api-key': 'SECRET_KEY'
    },
    json: true 
};




const db = admin.database();
var ref, email = "NO_MAIL";

exports.new_allotmentr = functions.database.ref('/allotments/{allotment_id}')
    .onCreate((snapshot, context) => {
      
        // Grab the newly added document
        const original = snapshot.val();
        console.log(original);

        // Check for files in the added document and update their relative paths
        if (original.files)
            original.files.forEach(file => {
                console.log(file);
                ref = db.ref("/files/" + file + "/CR");
                ref.set({status: "Given"});
            });

        
        
        if (original.person)
            if(original.person.emailAddress) {
                // Grab the email
                email = original.person.emailAddress;

                // append it to the array of recepients 
                options.body.emailTo.push(email);
                
                try {
                    request(options, function (error, response, body) {
                        // log the error instead of throwing it
                        if (error) console.log(error);
                    });                     
                } catch(err) {
                    console.log(err);
                }
            }



        
        // the function MUST return a promise, so I added the same email to the new node
        return snapshot.ref.child('person').child('emailAddress').set(email);
    });
