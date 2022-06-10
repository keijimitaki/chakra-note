import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Input, Button, Select, Spinner, Center, Stack, Box } from '@chakra-ui/react'
import { collection, getDocs, getFirestore, doc, setDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore'

import '../utils/firebase' 
import styles from './index.module.scss';

import Article from '../components/Article';
import { ArticleModel } from '../models/ArticleModel';
import { TagModel } from '../models/TagModel';

import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

import { UserContext } from '../store/contexts/user.context';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  auth} from '../utils/firebase';

import ScrollObserver from "../components/ScrollObserver";

export default function Articles() {

  //タグ
  const [tags, setTags] = useState<string[]>([]);
  const [searchText, setSearchText] =useState('');
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  //ログインユーザー
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState<string|null>(null); 
  //
  //const [searchText, setSearchText] =useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTags, setSearchTags] = useState<TagModel[]>([]);
  const [order, setOrder] = useState('');

  const keywordRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef(null);
  
  //ローディング状態
  const [finishLoading, setFinishLoading] = useState(true);

  // const [todos, setTodos] = useState([]);

  const [isActiveObserver, setIsActiveObserver] = useState(true)
  const [lastDoc, setLastDoc] = useState();


  // const fetchNextTodos = useCallback(async () => {
  //   const res = await fetch(
  //     `https://jsonplaceholder.typicode.com/todos?_start=${todos.length}&_limit=10`
  //   );
  //   const json = await res.json();
  //   // データをすべて取得したとき
  //   if (json.length === 0) {
  //     return setIsActiveObserver(false);
  //   }
  //   //@ts-ignore
  //   setTodos([...todos, ...json]);
  // }, [todos]);    


  const fetchNextArticles = useCallback(async () => {
    setFinishLoading(false);
    search();
    
  }, [articles]);

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
      //@ts-ignore
      setLastDoc(null);

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
    if(tags.length>0){

      const q = query(collection(db, "tags"), where("tag_name", "in", tags) );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        articleIds.push(doc.data().article_id);
      });
  
    }

    console.log(articleIds);
    let articlesQuery = null;
    if(articleIds.length>0){

      if(lastDoc) {
        articlesQuery = query(collection(db, "articles")
        ,where('article_id','in', articleIds)
        ,orderBy('created_at', 'desc')
        ,startAfter(lastDoc)
        ,limit(2));

      } else {
        articlesQuery = query(collection(db, "articles")
        ,where('article_id','in', articleIds)
        ,orderBy('created_at', 'desc')
        ,limit(2));

      }
    
    } else {

      if(lastDoc) {
        articlesQuery = query(collection(db, "articles")
        ,orderBy('created_at', 'desc')
        ,startAfter(lastDoc)
        ,limit(2));
        
      } else {
        articlesQuery = query(collection(db, "articles")
        ,orderBy('created_at', 'desc')
        ,limit(2));

      }
    }    

    const articlesSnapshot = await getDocs(articlesQuery);

    if(articlesSnapshot.docs.length <= 0){
      //@ts-ignore
      setLastDoc(null);
      setFinishLoading(true);

      return; 
    }

    const lastVisible = articlesSnapshot.docs[articlesSnapshot.docs.length-1];
    console.log("lastVisible", lastVisible);
    //@ts-ignore
    setLastDoc(lastVisible);

    let rows = new Array();
    for await(let doc of articlesSnapshot.docs) {

      const tq = query(collection(db, "tags"), where("article_id", "==", doc.id) );
      const tagSnapshot = await getDocs(tq);
      let tagNames:TagModel[] = [] ; 
      tagSnapshot.forEach((tag) => {
        tagNames.push({
          id:tag.id,
          tagName: tag.data().tag_name});
      });
      
      let row: ArticleModel = {
        id: doc.id,
        title: doc.data().title,
        content: doc.data().content,
        orgUrl: doc.data().url,
        favCount: doc.data().fav_count,
        author: doc.data().author_name, 
        premiumFlag: doc.data().premium_flag, 
        tags: tagNames
      }

      //keywordが設定されていたら、文字列が一致するもののみ
      // if(keywordRef.current!.value != ""){

      //   const checkStr = row.content;
      //   console.log(checkStr);

      //   if( checkStr != null && (checkStr.indexOf(keywordRef.current!.value)>=0)){
      //     rows.push(row);
      //     console.log('一致');

      //   }
      // } else {
      //   rows.push(row);

      // }
      
      rows.push(row);

    };

    setArticles([...articles, ...rows]);
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

    //@ts-ignore
    setLastDoc(null);
    //@ts-ignore
    setArticles([]);

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
                  onChange={(newTags) => setTags(newTags)}
                /> 
 
            </div>
            
            
            <div className={styles['right']} >
              <Select ref={orderRef} placeholder='' borderColor="blackAlpha" variant='outline'>
                <option value='created_at_desc'>投稿日時順</option>
                {/* <option value='option2'>Option 2</option>
                <option value='option3'>Option 3</option> */}
              </Select>
            </div>

          </div>

          <div className={styles['articleheader']}>記事一覧</div>
          

        </div>

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

        <div className={styles['grid']}>

          {(articles.length>0) && articles.map((row: any) => (

            <Article 
              key={row.id} 
              id={row.id} 
              author={row.author} 
              title={row.title} 
              content={row.content} 
              orgUrl={row.orgUrl}
              favCount={row.favCount}
              favedUid={myUid}
              tags={row.tags}
              premiumFlag={row.premiumFlag}
            />

          ))}

        </div>


        
      </div>

      <ScrollObserver
            onIntersect={fetchNextArticles}
            isActiveObserver={isActiveObserver}
          />
          
    </>


    
  );
}
