import { useState, useContext } from 'react';
import { UserContext } from '../store/contexts/user.context';

import { useRouter } from 'next/router';

import styles from './Header.module.scss';
import { Avatar, Box, Button, Flex, Heading, Link, Spacer, Stack, Text } from '@chakra-ui/react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';

import User from '../models/User'


const Header = () => {

  const storedUser = useContext(UserContext);

  //現在ユーザー取得
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;

    } else {
      console.log('onAuthStateChanged:','User is signed out');

    }

  });

  const router = useRouter();

  const handleClick = () => {   
    router.push('/article/edit/create'); 
  }

  const handleSingIn = () => {   
    router.push('/user/signin'); 
  }
  const handleSingUp = () => {   
    router.push('/user/signup'); 
  }

  const handleSingOut = async () => {
    await signOut(auth);
    storedUser.setCurrentUser();
    router.push('/'); 
  }

  const handleAvatar = () => {   
    router.push('/user/mypage'); 
  }

  return (
    <div>

      <Flex className={styles['l-header']} borderBottom='1px' pos="fixed" zIndex={10}>
        
        <Box p='4' bg='white.400'>
          <Text fontSize='2xl'>
            <b>
              <Link href='/' className={styles['apptitle']}>EndineerBase note</Link>
            </b>
          </Text>
        </Box>
        <Spacer />
        <Box p='4' bg='white.400'>
          {/* <Button onClick={handleClick2}>
            ログイン
          </Button> */}


        <Stack direction='row'>
          { (storedUser.currentUser != null) && (
              <>
              <Avatar className={styles['avatar']} name='Oshigaki Kisame' src='https://bit.ly/broken-link' onClick={handleAvatar} />
              <Box p="3" id="loginUserName" className={styles['username']} >
                { storedUser.currentUser && storedUser.currentUser['displayName']}
              </Box> 
              <Button onClick={handleSingOut} >
                ログオフ
              </Button>
            </>
            )  
          }
          { (storedUser.currentUser == null) && (
            <>
            <Button className={styles.button} onClick={handleSingIn}>
              ログイン
            </Button>
            <Button className={styles.button} onClick={handleSingUp}>
              新規登録
            </Button>
            </>
          )}

          { (storedUser.currentUser != null) && (
          <Button onClick={handleClick}>
            新規投稿
          </Button>
          )}

        </Stack>

        </Box>
      </Flex>

    </div>

  );

};

export default Header;
