import React, { useState, useEffect, useRef, useContext } from 'react';

import { VStack, Input, Text, Box, Center, Container, Grid, GridItem, SimpleGrid, Stack, Wrap, WrapItem, Square, Button, Select } from '@chakra-ui/react'

import { collection, getDocs, getFirestore, doc, setDoc, query, where, orderBy  } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import '../utils/firebase' 
import styles from './index.module.scss';

import Article from '../components/Article';
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import { UserContext } from '../store/contexts/user.context';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  auth} from '../utils/firebase';


export default function TermsOfService() {

 

  return (

    <>

<Stack spacing={3}>
  <Text fontSize='6xl' mt="135px">(6xl) In love with React & Next</Text>
  <Text fontSize='5xl'>(5xl) In love with React & Next</Text>
  <Text fontSize='4xl'>(4xl) In love with React & Next</Text>
  <Text fontSize='3xl'>(3xl) In love with React & Next</Text>
  <Text fontSize='2xl'>(2xl) In love with React & Next</Text>
  <Text fontSize='xl'>(xl) In love with React & Next</Text>
  <Text fontSize='lg'>(lg) In love with React & Next</Text>
  <Text fontSize='md'>(md) In love with React & Next</Text>
  <Text fontSize='sm'>(sm) In love with React & Next</Text>
  <Text fontSize='xs'>(xs) In love with React & Next</Text>
</Stack>

    </>


    
  );
}
