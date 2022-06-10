import { useState, useContext } from 'react';

import styles from './signin.module.scss';
import { useRouter } from 'next/router';

// import Button from '../../components/crwn/button.component';
// import FormInput from '../../components/crwn/form-input.component';

// https://firebase.google.com/docs/auth/web/password-auth?hl=ja
// https://zenn.dev/rinda_1994/articles/482a4c5967c3c3
//https://fir-ui-demo-84a6c.firebaseapp.com/
import {
  auth,
  //signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  // createUserDocumentFromAuth,
  // createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, Container, Spinner, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { signInWithEmailAndPassword  } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';


const defaultFormFields = {
  email: '',
  password: '',
};

export default function Singnin() {

  //ローディング状態
  const [finishLoading, setFinishLoading] = useState(true);
  //ログインエラー
  const [hasError, setHasError] = useState(false);

  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const router = useRouter();
  const { setCurrentUser } = useContext(UserContext);

  // @ts-ignore
  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log(event.target,name);

    setFormFields({ ...formFields, [name]: value });
  };
  

  // const signInWithDefault = async () => {

    
  //   console.log('ログイン前');
  //   console.log('email=',email);
  //   console.log('password=',password);

  //  // @ts-ignore 
  //   const ret = await signInWithEmailAndPassword(auth, email, password);
  //  // @ts-ignore
  //  console.log(ret);

  //   console.log('ログイン後')

  // };

  const signInWithFacebook = async () => {
    console.log('ログイン前')
    const { user } = await signInWithFacebookPopup();
    console.log(user);

    console.log('ログイン後')

  };

    // @ts-ignore
  //   const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   try {
  //     const response = await signInWithEmailAndPassword(auth,email,password);
  //     console.log(response);
  //     resetFormFields();
  //   } catch (error) {
  //   // @ts-ignore
  //   switch (error.code) {
  //       case 'auth/wrong-password':
  //         alert('incorrect password for email');
  //         break;
  //       case 'auth/user-not-found':
  //         alert('no user associated with this email');
  //         break;
  //       default:
  //         console.log(error);
  //     }
  //   }
  // };



  //ログイン
  const submitHander = async (e:any)=> {

    e.preventDefault();

    setFinishLoading(false);
    setHasError(false);

    console.log('ログイン前');
    console.log('email=',email);
    console.log('password=',password);

    console.log('finishLoading=',finishLoading);
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log('ログイン 成功');
      console.log(user);
      // @ts-ignore
      setCurrentUser(user);

      setFinishLoading(true);
      router.push('/'); 

    })
    .catch((error) => {

      setFinishLoading(true);
      setHasError(true);

      const errorCode = error.code;
      const errorMessage = error.message;

      console.log('ログイン 失敗');
      console.log(errorCode,errorMessage);

    });    

  
  }

  // rehop.dev@gmail.com rehopdev


  return (
    <Container>

      {!finishLoading && 
          <span className={styles['spinner']}>
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
          </span>
      }

      <form onSubmit={submitHander}>
        <VStack
          //divider={<StackDivider borderColor='gray.200' />}
          spacing={8}
          align='stretch'
        >

          <Text mt="200px">ログイン</Text>

          <Box h='60px'>
            <Button colorScheme='facebook' onClick={signInWithFacebook} /*leftIcon={<FaFacebook /> }*/>
              Facebook
            </Button>
          </Box>


          <Box h='60px'>
            <Text>メールアドレス</Text>
            <Input placeholder='' size='md' 
                name="email" onChange={handleChange} />
          </Box>

          <Box h='80px'>
          <Text>パスワード</Text>
            <Input placeholder='' size='md' 
                name="password" onChange={handleChange} />
          </Box>
          
          <Box h='90px'>
            <Button type="submit">ログイン</Button>
          </Box>

          {hasError &&
            <Alert status='error'>
              <AlertIcon />
              ユーザーが存在しません
            </Alert>          
          } 

        </VStack>
      </form>

    </Container>
  );
};


//export default Singnin;
