import * as React from "react";
import { Box, Center, Image, Flex, Badge, Text, Button, AspectRatio, Spacer } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import { collection, getDoc, getDocs, getFirestore, doc, deleteDoc, addDoc, setDoc, updateDoc, query, where, orderBy  } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import styles from './Fav.module.scss';
import { FavIconBorder, FavIconFavorite } from "./custom-icon/FavIcon";
import { useEffect, useState } from "react";

type Props = {
  articleId: string,
  favCount: number
  favedUid: string|null,
}


const Fav = (props: Props) => {
  
  const [faved, setFaved] = useState<boolean>(false);
  const [favCount, setFavCount] = useState<number>(0);
  const [favDocId, setFavDocId] = useState<string|null>(null);

  //初期値取得
  useEffect(() =>{

    console.log('Fav=>',props);

    setFavCount(props.favCount);
    
    if( props.favedUid == null){
      return;
    }
  
    (async ()=> {

      //記事いいね を取得
      const db = getFirestore();
      const q = query(collection(db, "favs"), where("article_id", "==", props.articleId), where("faved_uid", "==", props.favedUid) );
      const favSnapshot = await getDocs(q);
      
      console.log('favSnapshot.size=',favSnapshot.size);
      setFaved(false);
      if (favSnapshot.size > 0) {
        
        favSnapshot.forEach((doc) => {
          //@ts-ignore
          setFavDocId(doc.id);
          setFaved(true);
        });

      }


    })();


  },[props]);

  console.log('faved=>',faved);

  const clickHandler = (favToggle:boolean) => {

    (async ()=> {

      if( props.favedUid == null){
        return;
      }

      //記事いいね を更新
      const db = getFirestore();

      let plusOrMinus = 1;
      console.log('favToggle=',favToggle);

      if (favToggle) {
        const docRef = await addDoc(collection(db,'favs'),
        // @ts-ignore
          { article_id: props.articleId, faved_uid: props.favedUid }
        )
        setFaved(true);
        console.log('addFav=',docRef);
        setFavDocId(docRef.id);

      } else {
        console.log('deleteFav=',favDocId);
        if(favDocId){
          deleteDoc(doc(db, "favs", favDocId));
          plusOrMinus = -1;
          setFaved(false);
          setFavDocId(null);
  
        }

      }

      console.log('favCount=',favCount);
      setFavCount(favCount + plusOrMinus);

      //記事のいいね総数を更新
      const articleRef = doc(db, "articles", props.articleId);
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        
        let currentCount = 0;
        if(articleSnap.data().fav_count != undefined){
          currentCount = articleSnap.data().fav_count;
        }
        const updateTimestamp = await updateDoc(articleRef, {
          // @ts-ignore
          fav_count: currentCount + plusOrMinus,
       });

      }

    })();


  }

  return (
    <div>
      {/* {favDocId} */}
        { (faved) 
          ? <Box as={FavIconFavorite} className={styles['fav']} onClick={(e)=>clickHandler(false)} />
          : <Box as={FavIconBorder} className={styles['fav']} onClick={(e)=>clickHandler(true)} />
        }
        <Box>{favCount}</Box>
    </div>
  );
}

export default Fav;