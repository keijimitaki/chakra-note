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



const Payment = () => {

  const stripe = useStripe();
  const elements = useElements();
  
  //@ts-ignore
  const paymentHandler = async(e) => {    
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    console.log(JSON.stringify( { amount:1000 } ));
    // console.log(JSON.parse(JSON.stringify( { amount:1000 } )));

//firebase emulators:start --only functions

// const response = await fetch('functions/helloWorld', {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: '{ amount :2000 }'
//     }).then(res => res.json());

//     const { paymentIntent: { client_secret } } = response;

//     console.log(client_secret);

console.log('fetch');

//const response = await fetch(`/api/test`, {
  // const response = await fetch(`/about/ss`, {
  //     method: "GET",
  //   }).then(res => res.json());

  //   console.log(response);

//  await fetch('https://jsonplaceholder.typicode.com/posts', {method: 'GET'})
  await fetch('/api/checkout')
    .then(res => {res.json()})
    .then(data => {
      console.log(data);
    }).catch(error => {
      console.error('通信に失敗しました', error);
    })

}


  return (
    <div>
      <form >ss
        <Text mt="100px">STRIPE</Text>
        <CardElement/>
        <Button onClick={paymentHandler}>Pay Now</Button>

      </form>
    </div>
  );
};


export default Payment;
