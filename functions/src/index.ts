import * as functions from "firebase-functions";

//const stripe = require('stripe')('STRIPE_SECRET_KEY');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require("cors")({ origin: true });

const admin = require('firebase-admin');
admin.initializeApp();




export const createCheckoutSession = functions.https.onRequest(async (req, res) => {

    // res.set("Access-Control-Allow-Origin", "https://chakra-note.web.app"); 
    // res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    // res.set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");

/*
* Access to fetch at 'https://us-central1-chakra-note.cloudfunctions.net/createCheckoutSession' from origin 'https://chakra-note.web.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
*
*/
cors(req, res, async() => {

    console.log('createCheckoutSession');
    console.log('process.env.STRIPE_SECRET_KEY=>',process.env.STRIPE_SECRET_KEY);

    const domainUrl = `http://localhost:3000`;
    //const domainUrl = `https://chakra-note.web.app`;
    const { /*line_items,*/ customer_email } = req.body;

    console.log('req.body customer_uid,customer_email>',customer_email);

    if (!customer_email) {
        res.status(400).json({ error: 'missing required session parameters' });
        return;
    } 

    let session;

    try {

        const prices = await stripe.prices.list({
            lookup_keys: [req.body.lookup_key],
            expand: ['data.product'],
        });

        session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            mode: 'subscription',
            line_items: [
                {
                  price: prices.data[0].id,
                  // For metered billing, do not pass quantity
                  quantity: 1,
          
                },
              ],
            customer_email: customer_email,
            success_url: `${domainUrl}/user/payment-checkout?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainUrl}/user/canceled`
        });

        console.log('session=>',session);

        res.status(200).json({ sessionId: session.id});

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'an error occured, unable to create session' });
    }
    
});

});


export const createPortalSession = functions.https.onRequest(async (req, res) => {

    cors(req, res, async() => {
        const { session_id } = req.body;
        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

        //console.log(checkoutSession);
        // This is the url to which the customer will be redirected when they are done
        // managing their billing with the portal.
        //const returnUrl = YOUR_DOMAIN;
        const returnUrl = `http://localhost:3000`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: checkoutSession.customer,
            return_url: returnUrl,
        });

        console.log(portalSession);
        
        res.status(200).json({ url: portalSession.url });
        //res.redirect(303, portalSession.url);
        
    });

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

