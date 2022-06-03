import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import Header from '../components/Header';
import { UserProvider } from '../store/contexts/user.context';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import { extendTheme } from '@chakra-ui/react'

// 2. Update the breakpoints as key-value pairs

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <UserProvider>
        <Header />
        <Elements stripe={stripePromise}>
          <Component {...pageProps} />
        </Elements>
      </UserProvider>
    </ChakraProvider>
  )
};

export default MyApp;
