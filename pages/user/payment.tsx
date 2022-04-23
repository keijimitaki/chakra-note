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
  
  //@ts-ignore
  const paymentHandler = async(e) => {    
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }


  console.log('fetch');


  const response = await fetch('/api/checkout');
  //const response = await fetch('/api/hello');

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
