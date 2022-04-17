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


export default function Articles() {

  //タグ
  const [tags, setTags] = useState([]);
  const [searchText, setSearchText] =useState('');
  const [articles, setArticles] = useState([]);
  //ログインユーザー
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState<string|null>(null); 
  //
  //const [searchText, setSearchText] =useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [order, setOrder] = useState('');

  const keywordRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef(null);
  
  //初回データ取得
  useEffect(() => {
    //ログインユーザーを取得
    //現在ユーザーはこれを実施した後にしか取得できない
    onAuthStateChanged(auth, (authUser) => {

      if (authUser) {
        const uid = authUser.uid;
        //@ts-ignore
        setMyUid(uid);
      }

      console.log('search authUser.uid',myUid);
      search();

    }); 

  },[]);

  //検索
  const search = async() => {


    const db = getFirestore();
    
    //orderBy('created_at', 'desc')

    //タグが指定されていたら、
    //タグに紐づく複数記事IDを取得
    //複数記事IDで記事を取得

    let articleIds:string[] = [] ; 
    // タグを取得
    // @ts-ignore

    console.log(tags);

    if(tags.length>0){

      const q = query(collection(db, "tags"), where("tag_name", "in", tags) );
      const querySnapshot = await getDocs(q);
      // @ts-ignore
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        articleIds.push(doc.data().article_id);
      });
  
    }


    console.log(articleIds);
    let articlesQuery = null;
    if(articleIds.length>0){

      articlesQuery = query(collection(db, "articles")
        ,where('article_id','in', articleIds)
        ,orderBy('created_at', 'desc'));
    
    } else {
      articlesQuery = query(collection(db, "articles")
        ,orderBy('created_at', 'desc'));
    }    


    getDocs(articlesQuery).then( (articlesSnapshot) => {
      

      let rows = new Array();
      articlesSnapshot.docs.forEach(
        (doc) => {

          let row = {};
          // @ts-ignore
          row.id = doc.id;
          // @ts-ignore
          row.title = doc.data().title;
          // @ts-ignore
          row.content = doc.data().content;
          // @ts-ignore
          row.orgUrl = doc.data().url;
          // @ts-ignore
          row.favCount = doc.data().fav_count;
          //keywordが設定されていたら、文字列が一致するもののみ
          // if(keywordRef.current!.value != ""){
            if(false){

            //@ts-ignore
            const checkStr = row.content;
console.log(checkStr);

            if( checkStr != null && (checkStr.indexOf(keywordRef.current!.value)>=0)){
              rows.push(row);
              console.log('一致');

            }
          } else {
            rows.push(row);

          }

        });

      // @ts-ignore
      setArticles(rows);
      
    })

  };

  const searchHanlde = (event: any) => {
    const { name, value } = event.target;

    console.log(keywordRef.current!.value);
    console.log(tags);
    //@ts-ignore
    console.log(orderRef.current.value);
    search();
  }

  return (

    <>


      <div className={styles['page']}>
      
        <div className={styles['search']}>
          <Input ref={keywordRef} placeholder='' size='lg' id="seachKeyword"></Input>
          <Button onClick={searchHanlde}>検索</Button>
        </div>

        <div className={styles['search-detail']}>
          <ReactTagInput 
              tags={tags} 
              // @ts-ignore
              onChange={(newTags) => setTags(newTags)}
           />

          <Select ref={orderRef} placeholder=''>
            <option value='created_at_desc'>投稿日時順</option>
            <option value='option2'>Option 2</option>
            <option value='option3'>Option 3</option>
          </Select>

        </div>
        {myUid} 
        <div className={styles['grid']}>

          {(articles.length>0) && articles.map((row: any) => (

            <Article 
              key={row.id} 
              id={row.id} 
              title={row.title} 
              content={row.content} 
              orgUrl={row.orgUrl}
              favCount={row.favCount}
              favedUid={myUid} 
            />

          ))}

        </div>
      </div>
     
      {/* </Stack> */}
          

    </>


    
  );
}
