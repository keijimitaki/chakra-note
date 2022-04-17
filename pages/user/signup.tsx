import { useState, useContext } from 'react';

import styles from '.signin.module.scss';
import { Router, useRouter } from 'next/router';

// import Button from '../../components/crwn/button.component';
// import FormInput from '../../components/crwn/form-input.component';

// https://firebase.google.com/docs/auth/web/password-auth?hl=ja
// https://zenn.dev/rinda_1994/articles/482a4c5967c3c3
//https://fir-ui-demo-84a6c.firebaseapp.com/
import {
  auth,
  signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  signInWithGooglePopup,
  createUserDocumentFromAuth,
  createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack } from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';


const defaultFormFields = {
  email: '',
  password: '',
  note: '',
};

const Singnup = () => {

  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password, note } = formFields;

  const router = useRouter();
  const { setCurrentUser } = useContext(UserContext);

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  // @ts-ignore
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };
  

  const signInWithDefault = async () => {
    
    console.log('ログイン前');
    console.log('email=',email);
    console.log('password=',password);

   // @ts-ignore keiji3
    const ret = await signInAuthUserWithEmailAndPassword(email, password);
   // @ts-ignore
   console.log(ret);

    console.log('ログイン後')

  };

  const signInWithFacebook = async () => {
    console.log('ログイン前')
    const { user } = await signInWithFacebookPopup();
    console.log(user);

    console.log('ログイン後')

  };
  const signInWithGoogle = async () => {
    const { user } = await signInWithGooglePopup();
    await createUserDocumentFromAuth(user);
  };




  // 新規登録
  const submitHander = async (e:any)=> {
    e.preventDefault();

    if( email == null || password == null){
      alert('入力してください');
      return;
    }

    // try{
    //   const response = await createAuthUserWithEmailAndPassword(email,password);
    //   console.log('submit');
    //   console.log(response);
    // } catch(error) {
    //   console.log('error occured',error);
    // }
    console.log('email:',defaultFormFields);
    // @ts-ignore
    const { user } = createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      console.log(user);
      createUserDocumentFromAuth( user, { note } );
      resetFormFields();
      // @ts-ignore
      setCurrentUser(user);
      router.push('/user/mypage');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      console.log(errorCode,errorMessage);
    });
  }

  // rehop.dev@gmail.com rehopdev


  return (
    <Container>

      <form onSubmit={submitHander}>
        <VStack
          //divider={<StackDivider borderColor='gray.200' />}
          spacing={8}
          align='stretch'
        >

          <Text mt="200px">新規登録</Text>

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
          
          <Box h='80px'>
          <Text>備考</Text>
            <Input placeholder='' size='md' 
                name="note" onChange={handleChange} />
          </Box>

          <Box h='90px'>
            <Button type="submit">新規登録</Button>
          </Box>
        
        </VStack>
      </form>

    </Container>
  );
};


export default Singnup;
