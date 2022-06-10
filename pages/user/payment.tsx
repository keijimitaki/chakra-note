import { useState, useEffect, useContext } from 'react';

import styles from '.payment.module.scss';
import { useRouter } from 'next/router';

import {
  auth,
  // signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  // signInWithGooglePopup,
  // createUserDocumentFromAuth,
  // createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack } from '@chakra-ui/react';
import { signInWithEmailAndPassword  } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

console.log('node_env,',process.env.NODE_ENV);
   
console.log('current_url,',process.env.NEXT_PUBLIC_API_URL);
console.log('current_url3,',process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


const ProductDisplay = () => (
  <div>
          <Box h='160px'>
            <Button colorScheme='facebook'>
              Facebook
            </Button>
          </Box>
          <section>
    
    
    <div className="product">
      <Logo />
      <div className="description">
        <h3>Starter plan</h3>
        <h5>$20.00 / month</h5>
      </div>
    </div>
    <form action="/create-checkout-session" method="POST">
      {/* Add a hidden field with the lookup_key of your Price */}
      <input type="hidden" name="lookup_key" value="chnt-001-500" />
      <button id="checkout-and-portal-button" type="submit">
        Checkout
      </button>
    </form>
  </section>


  </div>
);

type SessionId = {
  sessionId: string;
};
const SuccessDisplay: React.FC<SessionId> = ( { sessionId } ) => {
  return (
    <section>
      <div className="product Box-root">
        <Logo />
        <div className="description Box-root">
          <h3>Subscription to starter plan successful!</h3>
        </div>
      </div>
      <form action="/create-portal-session" method="POST">
        <input
          type="hidden"
          id="session-id"
          name="session_id"
          value={sessionId}
        />
        <button id="checkout-and-portal-button" type="submit">
          Manage your billing information
        </button>
      </form>
    </section>
  );
};

type Message = {
  message: string;
};
const Message: React.FC<Message> = ( { message } ) => (
  <section>
    <p>{message}</p>
  </section>
);


const PaymentStripe = () => {

  let [message, setMessage] = useState('');
  let [success, setSuccess] = useState(false);
  let [sessionId, setSessionId] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    //const query = new URLSearchParams(window.location.search);

    const query = router.query;

    // if (query.get('success')) {
    if (query['success']) {
      setSuccess(true);
      //setSessionId(query.get('session_id'));

      let sesId: string | string[] | undefined = query['session_id'];
      if(sesId && !Array.isArray(sesId)){
        setSessionId(sesId);
      }

    }

    //if (query.get('canceled')) {
    if (query['canceled']) {
        setSuccess(false);
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, [sessionId]);

  if (!success && message === '') {
    return <ProductDisplay />;
  } else if (success && sessionId !== '') {
    return <SuccessDisplay sessionId={sessionId} />;
  } else {
    return <Message message={message} />;
  }
}


const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="14px"
    height="16px"
    viewBox="0 0 14 16"
    version="1.1"
  >
    <defs />
    <g id="Flow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="0-Default"
        transform="translate(-121.000000, -40.000000)"
        fill="#E184DF"
      >
        <path
          d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z"
          id="Pilcrow"
        />
      </g>
    </g>
  </svg>
);





const Payment = () => {

  const stripe = useStripe();
  const elements = useElements();
  
  const router = useRouter();
  const storedUser = useContext(UserContext);
  //ユーザー情報取得
  console.log('payment=>',storedUser);

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
  
  
  const response = await fetch(`http://localhost:5001/chakra-note/us-central1/createCheckoutSession`, {
  //const response = await fetch(`https://us-central1-chakra-note.cloudfunctions.net/createCheckoutSession`, {  
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
        "customer_uid": storedUser.currentUser!['uid'],
        "customer_email": "kemujidesign@gmail.com" 
      })
    }
  )
   
  //const data = await response.json();


  const res = await response.json();
  const sessionId = res.sessionId;
  console.log('sessionId=>', sessionId);
  console.log('res=>', res);
  
    // const { error } = await stripe.redirectToCheckout({
    //   sessionId
    // })
  
    // if(error){ 
    //   console.log(error);
    // }


    
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
