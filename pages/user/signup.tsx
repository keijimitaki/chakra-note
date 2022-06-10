import { useState, useContext } from 'react';

import styles from './signup.module.scss';
import { Router, useRouter } from 'next/router';

// import Button from '../../components/crwn/button.component';
// import FormInput from '../../components/crwn/form-input.component';

// https://firebase.google.com/docs/auth/web/password-auth?hl=ja
// https://zenn.dev/rinda_1994/articles/482a4c5967c3c3
//https://fir-ui-demo-84a6c.firebaseapp.com/
import {
  auth,
  db,
  //signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  // createUserDocumentFromAuth,
  // createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';

import { collection, getDoc, getFirestore, doc, setDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore'


import { Box, Button, Text, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';


const defaultFormFields = {
  email: '',
  password: '',
  note: '',
};

export default function Singnup() {

  //ローディング状態
  const [finishLoading, setFinishLoading] = useState(true);
  //ログインエラー
  const [hasError, setHasError] = useState(false);
    
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
  

  // const signInWithDefault = async () => {
    
  //   console.log('ログイン前');
  //   console.log('email=',email);
  //   console.log('password=',password);

  //   const ret = await signInWithEmailAndPassword(auth, email, password);
  //  console.log(ret);

  //   console.log('ログイン後')

  // };

  // const signInWithFacebook = async () => {
  //   console.log('ログイン前')
  //   const { user } = await signInWithFacebookPopup();
  //   console.log(user);

  //   console.log('ログイン後')

  // };



  // 新規登録
  const submitHander = async (e:any)=> {
    e.preventDefault();

    setFinishLoading(false);
    setHasError(false);

    if( email == null || password == null){
      alert('入力してください');
      return;
    }

    console.log('email:',defaultFormFields);
    // @ts-ignore
    const { user } = createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);

      const userDocRef = doc(db, 'users', user.uid);

      const userSnapshot = await getDoc(userDocRef);
    
      if (!userSnapshot.exists()) {
        const { displayName, email } = user;
        const createdAt = new Date();
    
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: email,
            display_name: displayName,
            prof_image_url: null,
            premium_user_flag: null,
            premium_join_at: null,
            premium_leave_at: null,
            created_at: createdAt,
            updated_at: null,
            ...{note},
          });
    
        } catch (error) {
          setHasError(true);
          setFinishLoading(true);
          
        }

        setFinishLoading(true);
    
      }
    

      

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
