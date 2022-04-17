import React, { useRef, useState, useContext, useEffect } from 'react';

import styles from './[id].module.scss';

import { collection, getDoc, getDocs, getFirestore, 
  doc, setDoc, addDoc, updateDoc, deleteDoc, query, where,
  serverTimestamp } from 'firebase/firestore'

import '../../../utils/firebase' // Initialize FirebaseApp
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";

// import { Provider } from 'react-redux';
import { useRouter } from 'next/router';

import ImageUpLoad from '../../../components/ImageUpLoad';

import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import { Grid, GridItem, Input, Stack, Textarea, Text, Button, RadioGroup, Radio, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';

import { UserContext } from '../../../store/contexts/user.context';

import User from '../../../models/User'


export default function EditForm() {
  
  //ログインユーザー
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState(null); 
  //記事作成者
  const [ authorUid, setAuthorUid] = useState(null);

  const router = useRouter();

  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const [image, setImage] = useState(null);
  const [titleVal, setTitleVal] = useState('');
  const [contentVal, setContentVal] = useState('');
  const [imageUrl ,setImageUrl] = useState(null);
  const [articleId, setArticleId] = useState('');

  const [newDataFlag, setNewDataFlag] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cancelRef = React.useRef(null);
  //タグ
  const [tags, setTags] = useState([]);
  //公開範囲
  const [premium, setPremium] = useState('0');
  
  //@ts-ignore
  //console.log('currentUser:',currentUser['email']);

  //初期値取得
  useEffect(() =>{
    
    (async ()=> {

      //ログインユーザーを取得
      const currentUser = storedUser.currentUser;
      if( currentUser != null ){
        setMyUid(currentUser['uid']);
      }

      const articleId = router.asPath.substring(router.asPath.lastIndexOf('/') + 1);      

      const db = getFirestore();
      const articleRef = doc(db, 'articles', articleId);
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        const data = articleSnap.data();

        const url = data.url;
        setArticleId(articleId);
        setImageUrl(url);
        setTitleVal(data.title);
        setContentVal(data.content);
        setAuthorUid(data.author_uid);

        setNewDataFlag(false);

        // タグを取得
        //@ts-ignore
        const q = query(collection(db, "tags"), where("article_id", "==", articleId));
        console.log("q:", q);

        const querySnapshot = await getDocs(q);
        // @ts-ignore
        let tagNames = [] ; 
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
          tagNames.push(doc.data().tag_name);
        });
        // @ts-ignore
        setTags(tagNames);

        // 公開範囲
        setPremium(data.premium_flag);

      } else {
        console.log("No such document!");
      }

    })();
    



  },[]);


  const [notification, setNotification] = useState('');

 
  //子から受け取り
  const changeImage = (image: any) => {
    setImage(image);
  }

  // 登録
  const handleClick = async() => {

    if( myUid == null ){
      alert('ログインしていないため登録できません');
      return;
    }

    // @ts-ignore
    const title = titleRef.current.value;
    // @ts-ignore
    const content = contentRef.current.value;

    if(title == null || content == null || image ==null){
      alert('1,2,3を設定してください');
      return;
    }

    const db = getFirestore();
    const createdAt = new Date();

    const articleRef = doc(collection(db, "articles"));
    await setDoc(articleRef, 
       // @ts-ignore
       { article_id: articleRef.id, author_uid: myUid, title: titleRef.current.value, content: contentRef.current.value,
       // @ts-ignore
       fav_count:0, premium_flag :premium, created_at: createdAt} 
    );

    // const articleRef = await addDoc(collection(db,'articles'),
    //   // @ts-ignore
    //   { author_uid: myUid, title: titleRef.current.value, content: contentRef.current.value,
    //   // @ts-ignore
    //   premium_flag :premium, created_at: createdAt} 
    // )

    const storage = getStorage();
    // @ts-ignore
    const imageRef = ref(storage, `/images/${articleRef.id}`);
    // @ts-ignore
    uploadBytes(imageRef , image)
        .then((snapshot) => {
          console.log("アップロードに成功しました");
        // Get the download URL
        getDownloadURL(imageRef)
          .then((url) => {
            // URLを設定
            setDoc(articleRef, {url: url}, { merge: true} );
          })
          .catch((error) => {
            switch (error.code) {
              case 'storage/object-not-found':
                // File doesn't exist
                break;
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
              case 'storage/canceled':
                // User canceled the upload
                break;
              case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break;
            }


            setNotification('投稿しました');
            setImage(null);
            setTitleVal('');

          });


        })

        .catch((error) => {
          console.log("アップロードに失敗しました");
        });
    

      // タグ
      // insert
      tags.forEach( async(tag)=> {
          const docRef = await addDoc(collection(db,'tags'),
            // @ts-ignore
            { article_id: articleRef.id, tag_name: tag , created_at: createdAt }
          ) 
        }
      )
    // router.replace('/');  
    router.push('/', undefined, { shallow: true })
  }

  //保存
  const handleSave = async() => {

    console.log('handleSave');

    // @ts-ignore
    const title = titleRef.current.value;
    // @ts-ignore
    const content = contentRef.current.value;

    if(title == null || content == null　){
      alert('タイトルと内容を設定してください');
      return;
    }

    // @ts-ignore
    console.log(titleRef.current.value);
    // @ts-ignore
    console.log(contentRef.current.value);

    const db = getFirestore();
    // const docRef = doc()
    const updateDocRef = doc(db, "articles", articleId); 
    const updateTimestamp = await updateDoc(updateDocRef, {
      // @ts-ignore
      title: titleRef.current.value, content: contentRef.current.value,
      premium_flag :premium,
      timestamp: serverTimestamp(),
   });

    console.log(updateDocRef.id);

    // ファイルが指定されていたら
    if(image){

      const storage = getStorage();
      // @ts-ignore
      const imageRef = ref(storage, `/images/${updateDocRef.id}`);
      // const imageRef = ref(storage, `/images/${image.name}`);
      // console.log(imageRef.name);
      console.log("uploadBytes",imageRef);
      // @ts-ignore
      uploadBytes(imageRef , image)
          .then((snapshot) => {
            console.log("アップロードに成功しました");
          // @ts-ignore
          //setImageUrl(`gs://chakura-note.appspot.com/images/${image.name}`);
  
          // Get the download URL
          getDownloadURL(imageRef)
            .then((url) => {
              // Insert url into an <img> tag to "download"
              // URLを設定
              setDoc(updateDocRef, {url: url}, { merge: true} );
            })
            .catch((error) => {
              // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              switch (error.code) {
                case 'storage/object-not-found':
                  // File doesn't exist
                  break;
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;
  
                // ...
  
                case 'storage/unknown':
                  // Unknown error occurred, inspect the server response
                  break;
              }
  
  
              setNotification('投稿しました');
              setImage(null);
              setTitleVal('');
  
            });
  
  
          })
  
          .catch((error) => {
            console.log("アップロードに失敗しました");
          });
            
    }


    // タグ
    // delete insert
    const q = query(collection(db, "tags"), where("article_id", "==", articleId));
    const querySnapshot = await getDocs(q);
    // @ts-ignore
    querySnapshot.forEach(async(doc) => {
      console.log(doc.id, " => ", doc.data());
      await deleteDoc(doc.ref);
    });

    const createdAt = new Date();

    console.log(tags);
    tags.forEach( async(tag)=> {
        const docRef = await addDoc(collection(db,'tags'),
          // @ts-ignore
          { article_id: articleId, tag_name: tag , created_at: createdAt }
        ) 
      }
    )


    
    // router.replace('/');  
    router.push('/', undefined, { shallow: true })


  }

  // 削除
  const handleDelete = async() => {

    const db = getFirestore();

    // タグ
    const q = query(collection(db, "tags"), where("article_id", "==", articleId));
    const querySnapshot = await getDocs(q);
    // @ts-ignore
    querySnapshot.forEach(async(doc) => {
      console.log(doc.id, " => ", doc.data());
      await deleteDoc(doc.ref);
    });

    // 写真と記事
    const storage = getStorage();
    const imageRef = ref(storage, `/images/${articleId}`);

    // Delete the file
    deleteObject(imageRef).then(() => {
      deleteDoc(doc(db, "articles", articleId));
      console.log('写真と記事を削除しました');      
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
    
    //router.push('/');  
    router.push('/', undefined, { shallow: true })
  }

  return (
    <>
      <Grid templateColumns='repeat(5, 1fr)' gap={6}>
        
        <GridItem w='100%' h='50' bg='blue.500' />
        <GridItem w='100%' h='10' bg='blue.500' >


        </GridItem>

        <GridItem w='100%' h='10' bg='blue.500' >

          <Stack spacing={3} mt="100px">
            
            <div>
              <b>画像アップロード</b>
            </div>
            <div>
              <ImageUpLoad changeImage={changeImage} defaultValue={imageUrl}></ImageUpLoad>
            </div>
            {/* <div>
{imageUrl && (
        <div>
          <img width="400px" src={imageUrl} alt="uploaded" />
        </div>
      )}

</div> */}

            <Text>タイトル</Text>
            <Input placeholder='' size='sm' 
               id="title" ref={titleRef} defaultValue={titleVal} 
               className={styles['eyecatch']} />


              <Text>本文</Text>
                  <Textarea
                    placeholder='Here is a sample placeholder'
                    size='sm'
                    id="content"
                    aria-label="minimum height"
                    style={{ width: 500 }}
                    ref={contentRef} 
                    defaultValue={contentVal}
                  />

            <Text>タグ</Text>
            <ReactTagInput 
                tags={tags} 
                // @ts-ignore
                onChange={(newTags) => setTags(newTags)}
            />

            <Text>公開範囲</Text>
            <RadioGroup onChange={setPremium} value={premium}>
              <Stack direction='row'>
                <Radio value='1'>有料会員限定</Radio>
                <Radio value='0'>すべてのユーザー</Radio>
              </Stack>
            </RadioGroup>

            <div>
              {notification}
            </div>
          
            { (newDataFlag) ? 
              <Button className={styles.button} onClick={handleClick}>投稿</Button> : 
              <Button className={styles.button} onClick={handleSave}>保存</Button>}
          


          </Stack>

        </GridItem>

        <GridItem w='100%' h='10' bg='blue.500' >


        </GridItem>
        
        <GridItem w='100%' h='10' bg='blue.500' >

        </GridItem>


        <Button onClick={onOpen}>記事削除</Button>
      <AlertDialog
        motionPreset='slideInBottom'
        // @ts-ignore
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          {/* <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
          <AlertDialogCloseButton /> */}
          <AlertDialogBody>
            記事を削除しますか？
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              いいえ
            </Button>
            <Button colorScheme='red' ml={3} onClick={handleDelete}>
              はい
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>      


      </Grid>

    </>
    


      




  );
}
