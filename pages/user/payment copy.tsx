import { useState, useContext } from 'react';

import styles from '.payment.module.scss';
import { useRouter } from 'next/router';

import {
  auth,
  signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  signInWithGooglePopup,
  createUserDocumentFromAuth,
  createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack } from '@chakra-ui/react';
import { signInWithEmailAndPassword  } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { resolve } from 'node:path/win32';



const Payment = () => {

  const stripe = useStripe();
  const elements = useElements();
  
  const router = useRouter();

  console.log('node_env,',process.env.NODE_ENV);
   
  console.log('current_url,',process.env.NEXT_PUBLIC_API_URL);
  console.log('current_url3,',process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  

  //@ts-ignore
  const paymentHandler = async(e) => {    
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }



  const query = new URLSearchParams(window.location.search);
  console.log('current_url,',query);

  //const response = await fetch('/api/checkout');
  //const response = await fetch('/api/hello');
  
  
  //const response = await fetch(`http://localhost:5001/chakra-note/us-central1/createCheckoutSession`, {
  const response = await fetch(`https://us-central1-chakra-note.cloudfunctions.net/createCheckoutSession`, {  
    method: 'POST', 
    headers: {
       "Content-Type": "application/json"
    },
    body: JSON.stringify( {
        "line_items": [
          {
            "quantity": 1,
            "price_data": {
              "currency": "usd",
              "unit_amount": 2800,
              "product_data": {
                "name": "サブスク"
              }
            }
          }
        ],
        "customer_email": "kemujidesign@gmail.com" 
      })
    }
  )
   
  //const data = await response.json();


  const res = await response.json();
  const sessionId = res.sessionId;
  console.log('sessionId=>', sessionId);

    const { error } = await stripe.redirectToCheckout({
      sessionId
    })
  
    if(error){ 
      console.log(error);
    }

}


  return (
    <div>
      <form >ss
        <Text mt="100px">STRIPE</Text>
        
        <Button onClick={paymentHandler}>Pay Now</Button>

      </form>
    </div>
  );
};


export default Payment;
