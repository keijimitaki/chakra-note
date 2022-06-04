import React, { useRef, useState, useContext, useEffect } from 'react';

import styles from './[id].module.scss';

import { collection, getDoc, getDocs, getFirestore, 
  doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp } from 'firebase/firestore'

import '../../utils/firebase' // Initialize FirebaseApp
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";

// import { Provider } from 'react-redux';
import { useRouter } from 'next/router';


import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import { Image, Grid, GridItem, Input, Center, Stack, Textarea, Text, Button, RadioGroup, Radio, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter, AspectRatio, Box, Badge } from '@chakra-ui/react';

import { UserContext } from '../../store/contexts/user.context';

import Comment from '../../components/Comment';
import Fav from '../../components/Fav';

import { FavIconBorder,FavIconFavorite } from "../../components/custom-icon/FavIcon";
import User from '../../models/User'



export default function EditForm() {
  
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const router = useRouter();

  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const commentRef = useRef(null);

  const [image, setImage] = useState(null);
  const [titleVal, setTitleVal] = useState('');
  const [contentVal, setContentVal] = useState('');
  const [imageUrl ,setImageUrl] = useState(null);
  const [articleId, setArticleId] = useState('');
  const [favCount, setFavCount] = useState<number>(0);

  const [newDataFlag, setNewDataFlag] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cancelRef = React.useRef(null);
  //タグ
  const [tags, setTags] = useState([]);
  //公開範囲
  const [premium, setPremium] = useState('0');
  
  //コメント
  const [comments, setComments] = useState([]);

  //ログインユーザー
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState(''); 
  //記事作成者
  const [authorUid, setAuthorUid] = useState(null); 


  //初期値取得
  useEffect(() =>{
    
    //ログインユーザーを取得
    const currentUser = storedUser.currentUser;
    if( currentUser != null ){
      setMyUid(currentUser['uid']);
    }

    (async ()=> {

      const articleId = router.asPath.substring(router.asPath.lastIndexOf('/') + 1);      
      const db = getFirestore();
      const articleRef = doc(db, 'articles', articleId);
  
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        const data = articleSnap.data();
        setImageUrl(data.url);
        setTitleVal(data.title);
        setContentVal(data.content);
        setArticleId(articleId);
        
        setAuthorUid(data.author_uid);
        setNewDataFlag(false);
        
        setFavCount(data.fav_count);

        // タグを取得
        // @ts-ignore
        const q = query(collection(db, "tags"), where("article_id", "==", articleId) );
        const querySnapshot = await getDocs(q);
        // @ts-ignore
        let tagNames = [] ; 
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
          tagNames.push({
            id:doc.id,
            tagName: doc.data().tag_name});
        });
        // @ts-ignore
        setTags(tagNames);

        // 公開範囲
        setPremium(data.premium_flag);

        //コメントを取得
        const commentsQuery = query(collection(db, "comments"), where("article_id", "==", articleId) , orderBy("created_at","desc"));
        console.log("commentsQuery:", commentsQuery);
        const commentsSnapshot = await getDocs(commentsQuery);
        // @ts-ignore
        let comments = [] ; 
        commentsSnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
          
          const date = doc.data().created_at;
          const format = (date: Date) => {
            const year = date.getFullYear();
            const month = ('00' + (date.getMonth() + 1)).slice(-2);
            const day = ('00' + date.getDate()).slice(-2);
            const hours = ('00' + date.getHours()).slice(-2);
            const minutes = ('00' + date.getMinutes()).slice(-2);
            return `${year}/${month}/${day} ${hours}:${minutes}`;
          };
          const formatedDate = format(date.toDate());
          console.log(formatedDate);
          console.log(doc.id);

          comments.push({
            docId: doc.id,
            commentedUid: doc.data().commented_uid,
            articleId: doc.data().article_id,
            comment: doc.data().comment,
            createdAt: formatedDate,
          });
        });
        //@ts-ignore
        setComments(comments);
        

      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }

    })();


  },[]);


  //コメント投稿
  const handleSave = async() => {

    // @ts-ignore
    const comment = commentRef.current.value;
    // @ts-ignore
    const userId = storedUser.currentUser.id;

    if(comment == null) {
      alert('コメントを設定してください');
      return;
    }

    const db = getFirestore();
    const createdAt = new Date();
    const docRef = await addDoc(collection(db,'comments'),
      // @ts-ignore
      { article_id: articleId, commented_uid: myUid, comment: comment , created_at: createdAt}
    )
    console.log(docRef);
    //@ts-ignore
    commentRef.current.value = '';

    console.log('handleSaved');
    
    
    //コメントを取得
    const commentsQuery = query(collection(db, "comments"), where("article_id", "==", articleId), orderBy("created_at","desc"));
    console.log("commentsQuery:", commentsQuery);
    const commentsSnapshot = await getDocs(commentsQuery);
    // @ts-ignore
    let commentsList = [] ; 
    commentsSnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      
      const date = doc.data().created_at;
      const format = (date: Date) => {
        const year = date.getFullYear();
        const month = ('00' + (date.getMonth() + 1)).slice(-2);
        const day = ('00' + date.getDate()).slice(-2);
        const hours = ('00' + date.getHours()).slice(-2);
        const minutes = ('00' + date.getMinutes()).slice(-2);
        return `${year}/${month}/${day} ${hours}:${minutes}`;
      };
      const formatedDate = format(date.toDate());
      console.log(formatedDate);
      console.log(doc.id);

      commentsList.push({
        docId: doc.id,
        commentedUid: doc.data().commented_uid,
        articleId: doc.data().article_id,
        comment: doc.data().comment,
        createdAt: formatedDate,
      });

    });
    //@ts-ignore
    setComments(commentsList);    

  }

  //コメント削除
  const deleteComment = async(id:string) => {

    const db = getFirestore();


    //
    //const storage = getStorage();
    // const commentRef = ref(storage, `/comments/${id}`);
    deleteDoc(doc(db, "comments", id));
    // // Delete the file
    // deleteObject(commentRef).then(() => {
    //   deleteDoc(doc(db, "articles", docId));
    //   console.log('写真と記事を削除しました');      
    // }).catch((error) => {
    //   // Uh-oh, an error occurred!
    // });

    //コメントを取得
    const commentsQuery = query(collection(db, "comments"), where("article_id", "==", articleId), orderBy("created_at","desc"));
    console.log("commentsQuery:", commentsQuery);
    const commentsSnapshot = await getDocs(commentsQuery);
    // @ts-ignore
    let commentsList = [] ; 
    commentsSnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      
      const date = doc.data().created_at;
      const format = (date: Date) => {
        const year = date.getFullYear();
        const month = ('00' + (date.getMonth() + 1)).slice(-2);
        const day = ('00' + date.getDate()).slice(-2);
        const hours = ('00' + date.getHours()).slice(-2);
        const minutes = ('00' + date.getMinutes()).slice(-2);
        return `${year}/${month}/${day} ${hours}:${minutes}`;
      };
      const formatedDate = format(date.toDate());
      console.log(formatedDate);
      console.log(doc.id);

      commentsList.push({
        docId: doc.id,
        commentedUid: doc.data().commented_uid,
        articleId: doc.data().article_id,
        comment: doc.data().comment,
        createdAt: formatedDate,
      });

    });
    //@ts-ignore
    setComments(commentsList);        
        
  } 

  //編集画面
  const moveEditHandler =(articleId: string) => {
    router.push('/article/edit/' + articleId);
  }

  return (
    <>
      <Grid templateColumns='repeat(5, 1fr)' gap={6}>
        
        <GridItem w='100%' h='50' bg='blue.500' />
        <GridItem w='100%' h='10' bg='blue.500' />
        <GridItem w='100%' h='10' bg='blue.500' >

          <Stack spacing={3} mt="150px">
           
          <Stack direction='row'>
            <Box minW="660px;">
              {(tags.length>0) && tags.map((row: any) => (
                <Badge key={row.id} ml='3'>{row.tagName}</Badge>
              ))}
            </Box>
            <Box><Fav articleId={articleId} favCount={favCount} favedUid={myUid} /></Box>
          </Stack>

            <div>
              <AspectRatio minW='720px' maxW='720px' maxH='330px' ratio={4 / 3}>
                <Image borderRadius="md" src={ imageUrl! } objectFit='cover'/>
              </AspectRatio>
              
            </div>

            { (myUid != null) && (myUid == authorUid) && 
              <Button onClick={()=>moveEditHandler(articleId)}>編集</Button>
            }

            <Text><b>{titleVal}</b></Text>
             
            <Textarea
              placeholder='Here is a sample placeholder'
              size='sm'
              id="content"
              aria-label="minimum height"
              style={{ width: 720, height:200 }}
              ref={contentRef} 
              isReadOnly={true}
              variant='unstyled'
              defaultValue={contentVal}
            />


            <Textarea
              placeholder='Here is a sample placeholder'
              size='sm'
              id="comment"
              aria-label="minimum height"
              style={{ width: 720 }}
              ref={commentRef} 
            />

          

          <Center h='100px' >
            <Button onClick={handleSave}>コメント投稿</Button>
          </Center>


              <div>

              {(comments.length>0) && comments.map((row: any) => (

                
                <Comment 
                  key={row.docId}
                  docId={row.docId}
                  articleId={row.articleId}
                  commentedUid={row.commentedUid}
                  comment={row.comment}
                  createdAt={row.createdAt}
                  //@ts-ignore
                  deletable={ (myUid === row.commentedUid ) }
                  //@ts-ignore
                  delHandler={()=> deleteComment(row.docId)}/>

              ))}

              </div>


          </Stack>


        </GridItem>
      
      </Grid>
    
    </>


  );
}
