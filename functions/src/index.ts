import * as functions from "firebase-functions";

//const stripe = require('stripe')('STRIPE_SECRET_KEY');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const admin = require('firebase-admin');
admin.initializeApp();


export const createCheckoutSession = functions.https.onRequest(async (req, res) => {
    
    console.log('createCheckoutSession');
    console.log('process.env.STRIPE_SECRET_KEY=>',process.env.STRIPE_SECRET_KEY);

    const domainUrl = `http://localhost:3000`;
    const { line_items, customer_email } = req.body;

    if (!customer_email) {
        res.status(400).json({ error: 'missing required session parameters' });
        return;
    } 

    let session;

    try {
        session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            customer_email,
            success_url: `${domainUrl}/success?sesion_id={CHECKOUT_SESSSIO_ID}`,
            cancel_url: `${domainUrl}/canceled`
        });
        res.status(200).json({ sessionId: session.id });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'an error occured, unable to create session' });
    }
    

});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    console.log('addMessage=>',req.method);
    
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('messages').add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
});


exports.httpEvent = functions.https.onRequest((req, res) => {
    switch (req.method) {
        case 'GET':
            const param = req.query.param;
            console.log('param=>',param);
            break
        case 'POST':
            console.log('req.body=>',req.body);
            break
        default:
            res.status(400).send("error")
            break
    }
    res.send("end httpEvent!");
});

// exports.postMessage = functions.https.onCall(async (data, context) => {
//     console.log('postMessage=>',data);

// });


export const helloWorld = functions.https.onRequest((request, response) => {
  console.log('helloWorld');
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

