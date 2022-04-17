import * as functions from "firebase-functions";

const stripe = require('stripe')('STRIPE_SECRET_KEY');

exports.createStripeCharge = functions.firestore
    .document('charges/{pushId}')
    .onCreate(async (snap, context) => {
    try {
        const charge = {
            amount : snap.data().amount,
            source: snap.data().source.id,
            currency: snap.data(),
        }
        const idempotencyKey = context.params.pushId
        const response = await stripe.charges.create(charge, {
            idempotency_key: idempotencyKey
        })

        await snap.ref.set(response, {
            merge: true
        })

    }  catch (error) {
        await snap.ref.set({
            error: userFacingMessage(error)
        }, {
            merge: true
        })
    }
})

function userFacingMessage(error: any) {
    return error.type ? error.message : 'An error occurred, developers have been alerted';
}


export const helloWorld = functions.https.onRequest((request, response) => {
  console.log('helloWorld');
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
