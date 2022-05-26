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



const PaymentCheckout = () => {

  const stripe = useStripe();
  const elements = useElements();
  
  const router = useRouter();

  //@ts-ignore
  const paymentHandler = async(e) => {    
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    const { session_id } = router.query;

console.log(session_id);

    const response = await fetch(`http://localhost:5001/chakra-note/us-central1/createPortalSession`, {
    //const response = await fetch(`https://us-central1-chakra-note.cloudfunctions.net/createPortalSession`, {  
      method: 'POST', 
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify( {
          "session_id": session_id
        })
      }
    )
  
  
    const res = await response.json();
    const url = res.url;
    console.log('url=>', url);
  
    // const { error } = await stripe.redirectToCheckout({
    //   sessionId
    // })
  
    // if(error){ 
    //   console.log(error);
    // }

      

  }

  return (
    <div>
      <form>
        <Text pt="100px"></Text>
        
        <button onClick={paymentHandler}>
          Manage your billing information
        </button>

      </form>
    </div>
  );

};


export default PaymentCheckout;
