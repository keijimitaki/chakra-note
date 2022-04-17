import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Header from '../components/Header';
import { UserProvider } from '../store/contexts/user.context';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';

const theme = extendTheme({
  // colors: {
  //   brand: {
  //     100: "#f7fafc",
  //     // ...
  //     900: "#1a202c",
  //   },
  // },
  // breakpoints : {
  //   sm: '600px',
  //   md: '900px',
  //   lg: '1200px',
  //   xl: '1536px',
  //   '2xl': '96em',
  // }

});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
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
