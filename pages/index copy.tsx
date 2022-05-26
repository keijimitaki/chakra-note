import React, { useState, useEffect, useRef, useContext } from 'react';

import { VStack, Input, Text, Box, Center, Container, Grid, GridItem, SimpleGrid, Stack, Wrap, WrapItem, Square, Button, Select, Spinner } from '@chakra-ui/react'

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
  
  //ローディング状態
  const [finishLoading, setFinishLoading] =useState(false);


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

    setFinishLoading(false);
    const db = getFirestore();
    
    //orderBy('created_at', 'desc')

    //タグが指定されていたら、
    //タグに紐づく複数記事IDを取得
    //複数記事IDで記事を取得

    let articleIds:string[] = [] ; 
    // タグを取得
    // @ts-ignore

    //console.log(tags);

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

          const tq = query(collection(db, "tags"), where("article_id", "==", doc.id) );
          // getDocs(tq).then( (tagSnapshot ) => {
          //   // @ts-ignore
          //   let tagNames = [] ; 
          //   tagSnapshot.forEach((tag) => {
          //     console.log(tag.id, " => ", tag.data());
          //     tagNames.push({
          //       id:tag.id,
          //       tagName: tag.data().tag_name});
          //   });
          //   // @ts-ignore
          //   row.tags = tagNames;

          // });

          async() => {
            const tagSnapshot = await getDocs(tq);
            // @ts-ignore
            let tagNames = [] ; 
            tagSnapshot.forEach((tag) => {
              console.log(tag.id, " => ", tag.data());
              tagNames.push({
                id:tag.id,
                tagName: tag.data().tag_name});
            });
            // @ts-ignore
            row.tags = tagNames;

          }


// @ts-ignore
          //row.tags = [{'id':'1','tagName':'aaa名前'},{'id':'2','tagName':'bbb名前'}];

          //keywordが設定されていたら、文字列が一致するもののみ
          if(keywordRef.current!.value != ""){
          //  if(false){

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

    console.log('articles=',articles);

    setFinishLoading(true);
    
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
          <Input ref={keywordRef} placeholder='' id="seachKeyword" borderColor="blackAlpha" ></Input>
          <Button onClick={searchHanlde} colorScheme="blackAlpha" variant='outline'>検索</Button>
        </div>

        <div className={styles['search-detail']}>

          <div className={styles['d1header']}>タグ絞り込み</div>

          <div className={styles['d1']} >

            <div className={styles['left']} >
              
              <ReactTagInput
                  tags={tags} 
                  // @ts-ignore
                  onChange={(newTags) => setTags(newTags)}
                /> 
 
            </div>
            
            
            <div className={styles['right']} >
              <Select ref={orderRef} placeholder='' borderColor="blackAlpha" variant='outline'>
                <option value='created_at_desc'>投稿日時順</option>
                <option value='option2'>Option 2</option>
                <option value='option3'>Option 3</option>
              </Select>
            </div>

          </div>

          <div className={styles['articleheader']}>記事一覧</div>
          

        </div>

        { !finishLoading && (
          <div className={styles['search']}>
            <Spinner/>
          </div>)
        }

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
              tags={row.tags}
            />

          ))}

        </div>
      </div>
     
      {/* </Stack> */}
          

    </>


    
  );
}
