import React, { useRef, useState, useContext, useEffect, useCallback } from 'react';

import '../../utils/firebase' // Initialize FirebaseApp
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";

import { collection, getDoc, getDocs, getFirestore, 
  doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, 
  startAfter,
  limit} from 'firebase/firestore'

import { signInWithEmailAndPassword } from 'firebase/auth';

import styles from './mypage.module.scss';
import User from '../../models/User'

import { UserModel } from '../../models/UserModel';
import { ArticleModel } from '../../models/ArticleModel';
import { TagModel } from '../../models/TagModel';

// import Button from '../../components/crwn/button.component';
// import FormInput from '../../components/crwn/form-input.component';

// https://firebase.google.com/docs/auth/web/password-auth?hl=ja
// https://zenn.dev/rinda_1994/articles/482a4c5967c3c3
//https://fir-ui-demo-84a6c.firebaseapp.com/
import {
  auth,
  // signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  // signInWithGooglePopup,
  // createUserDocumentFromAuth,
  // createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, useToast, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack, RadioGroup, Radio, Center, Spinner } from '@chakra-ui/react';
import { onAuthStateChanged, updatePassword } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';
import Article from '../../components/Article';
import ImageUpLoad from '../../components/ImageUpLoad';

import { useRouter } from 'next/router';
import { ssrEntries } from 'next/dist/build/webpack/plugins/middleware-plugin';
import ScrollObserver from '../../components/ScrollObserver';
const defaultFormFields = {
  displayName: '',
  password: '',
};


const Mypage = () => {
  const toast = useToast();
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, password } = formFields;
  
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState<string|null>(null); 

  const [userName ,setUserName] = useState('');
  const [emailVal ,setEmailVal] = useState('');

  const [image, setImage] = useState(null);
  const [imageUrl ,setImageUrl] = useState(null);
  const [articles, setArticles] = useState<ArticleModel[]>([]);

  //ローディング状態
  const [finishLoading, setFinishLoading] = useState(true);
  const [isActiveObserver, setIsActiveObserver] = useState(true)
  const [lastDoc, setLastDoc] = useState();

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  // @ts-ignore
  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log(event.target,name);
    setFormFields({ ...formFields, [name]: value });
  };
  

    // @ts-ignore
    const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await signInWithEmailAndPassword(auth, emailVal,password);
      console.log(response);
      resetFormFields();
    } catch (error) {
    // @ts-ignore
    switch (error.code) {
        case 'auth/wrong-password':
          alert('incorrect password for email');
          break;
        case 'auth/user-not-found':
          alert('no user associated with this email');
          break;
        default:
          console.log(error);
      }
    }
  };


  const router = useRouter();

const handlerPayment = () => {   
  router.push('/user/payment'); 
}

  //子から受け取り
  const changeImage = (image: any) => {
    setImage(image);
  }


  //ユーザー情報取得
  useEffect(() =>{
    
    
    //@ts-ignore
    setLastDoc(null);

    console.log('useEffect=>');

      //現在ユーザーはこれを実施した後にしか取得できない
      onAuthStateChanged(auth, (authUser) => {


        if (authUser) {
          const uid = authUser.uid;
          setMyUid(uid);

          // console.log('doc:',data);
          const f = async ()=> {

            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            
            const userSnap = await getDoc(userRef);
            console.log('userSnap:',userSnap);
              //@ts-ignore
            setEmailVal(authUser.email);

            let curretUser:UserModel = {
              uid: uid,
              email: authUser.email,
              displayName: displayName,
              profImageUrl: null,
              createdAt: null,
            };

            if (userSnap.exists()) {
              const data = userSnap.data();
              
              curretUser.displayName = data.display_name;
              curretUser.profImageUrl = data.prof_image_url;
              curretUser.createdAt = data.created_at;

              console.log('userSnap:',data);
              setUserName(data.display_name);
              setImageUrl(data.prof_image_url);

            } else {
              // doc.data() will be undefined in this case
              console.log("No such userSnap");
            }

              //@ts-ignore
              storedUser.setCurrentUser(curretUser);

            // const storage = getStorage();
            // const articlesQuery = query(collection(db, "articles"),where('author_uid', '==' ,uid), orderBy('created_at', 'desc'));
            // const articlesSnapshot = await getDocs(articlesQuery);
            
            // console.log('articlesSnapshot=>',articlesSnapshot);

            // let rows = new Array();
            // for await(let doc of articlesSnapshot.docs) {
      
            //     const tq = query(collection(db, "tags"), where("article_id", "==", doc.id) );
            //     const tagSnapshot = await getDocs(tq);

            //     let tagNames:TagModel[] = []; 
            //     tagSnapshot.forEach((tag) => {
            //       console.log(tag.id, " => ", tag.data());
            //       tagNames.push({
            //         id:tag.id,
            //         tagName: tag.data().tag_name});
            //     });

            //     let row: ArticleModel = {
            //       id: doc.id,
            //       title: doc.data().title,
            //       content: doc.data().content,
            //       orgUrl: doc.data().url,
            //       favCount: doc.data().fav_count,
            //       author: doc.data().author_name, 
            //       premiumFlag: doc.data().premium_flag, 
            //       tags: tagNames
            //     }
      
            //     rows.push(row);
            
            // };
            
            // setArticles(rows);
            
            search(uid);

          };
          
          f();
            

        } else {
          // User is signed out
          console.log('onAuthStateChanged:','User is signed out');
          // ...
        }

      });
 
    

  },[]);

  // 保存
  const submitHander = async (e:any)=> {
    e.preventDefault();

    //パスワードが変更できない
    //プロフィール画像が初期化されないように。プロフィール画像を削除できる機能
    //ユーザー削除

    const db = getFirestore();
    // const docRef = doc()

      //現在ユーザーはこれを実施した後にしか取得できない
      onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          const uid = authUser.uid;

          (async ()=> {

            let currentUser:UserModel = {
              uid: uid,
              email: authUser.email,
              displayName: displayName,
              profImageUrl: null,
              createdAt: null,
            };

            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            
            const userSnap = await getDoc(userRef);
            let currentProfUrl = null;
            // ファイルが指定されていたら
            if(image){
              const storage = getStorage();
              // @ts-ignore
              const imageRef = ref(storage, `/prof_images/${uid}`);
              // @ts-ignore
              uploadBytes(imageRef , image)
               .then((snapshot) => {
                 console.log("アップロードに成功しました");
                // Get the download URL
                getDownloadURL(imageRef)
                 .then((url) => {
                   // URLを設定
                   const updateTimestamp = updateDoc(userRef, {
                    // @ts-ignore
                    prof_image_url: url,
                    display_name: displayName,
                    updated_at: serverTimestamp()
                 });
                 
                  setImage(image);
                  currentUser.profImageUrl = url;
                  currentUser.displayName = displayName;
                  //@ts-ignore
                  storedUser.setCurrentUser(currentUser);

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
       
                 });
       
       
               })
               .catch((error) => {
                 console.log("アップロードに失敗しました");
               });

            } else {

              const data = userSnap.data();
              // @ts-ignore
              currentProfUrl = data.prof_image_url;
              //ユーザー情報更新
              const updateTimestamp = await updateDoc(userRef, {
                // @ts-ignore
                display_name: displayName,
                // @ts-ignore
                prof_image_url: data.prof_image_url,
                updated_at: serverTimestamp()
             });
  
             currentUser.profImageUrl = currentProfUrl;
             currentUser.displayName = displayName;
            //@ts-ignore
            storedUser.setCurrentUser(currentUser);

            }


            //パスワードが更新されていたら
            const user = auth.currentUser;
            console.log('currentUser=>',user);


            if(password != "" && user != null){
              updatePassword(user, password).then(() => {
                // Update successful.
              }).catch((error) => {
                // エラー処理
                // An error ocurred
                // ...
              });
            }

          })();

          
          toast({
            // title: 'メッセージ',
            description: "更新しました",
            status: 'success',
            // duration: 9000,
            // isClosable: true,
          });
      
        } else {
          // User is signed out
          console.log('onAuthStateChanged:','User is signed out');
          // ...
        }

      });
     

  }


  const fetchNextArticles = useCallback(async () => {
    setFinishLoading(false);
    // onAuthStateChanged(auth, (authUser) => {

    //   if (authUser) {
    //     search(authUser.uid);
    //   }

    // })

    //@ts-ignore
    search(myUid);
    
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
      //setLastDoc(null);

      console.log('search authUser.uid',myUid);
      // search();

    }); 
   

  },[]);


  const search = async(uid:string) => {

    const db = getFirestore();
    const storage = getStorage();
  
console.log('myUid=>',myUid);

    let articlesQuery = null;
    if(lastDoc) {

      articlesQuery = query(collection(db, "articles")
        ,where('author_uid', '==' ,uid)
        , orderBy('created_at', 'desc')
        ,startAfter(lastDoc)
        ,limit(2));

    
    } else {
      articlesQuery = query(collection(db, "articles")
        ,where('author_uid', '==' ,uid)
        , orderBy('created_at', 'desc')
        ,limit(2));

    }

  const articlesSnapshot = await getDocs(articlesQuery);
  console.log('articlesSnapshot=>',articlesSnapshot);
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

      let tagNames:TagModel[] = []; 
      tagSnapshot.forEach((tag) => {
        console.log(tag.id, " => ", tag.data());
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

      rows.push(row);
  
  };
  
  setArticles([...articles, ...rows]);
  setFinishLoading(true);
  

};




  return (
    <>

      <form onSubmit={submitHander}>
        
        <Center>
        <Stack
          spacing={8}
          align='stretch'
        >

          <Text mt="100px">ユーザー情報</Text>

          <Box h='60px'>
            <Text>ユーザー名</Text>
            <Input placeholder='' size='md' defaultValue={userName} 
                name="displayName" onChange={handleChange} />
          </Box>
          <Box h='60px'>
            <Text>パスワード</Text>
            <Input placeholder='' size='md' defaultValue={password} 
                name="password" onChange={handleChange} />
          </Box>

          <div>
              <b>プロフィール</b>
            </div>
            <div>
              <ImageUpLoad changeImage={changeImage} defaultValue={imageUrl} profFlag={true}></ImageUpLoad>
            </div>

          <Box h='60px'>
            <Text>メールアドレス</Text>
            {emailVal}
          </Box>

          <Box h='60px'>
            <Button type="button" onClick={handlerPayment}>有料会員登録</Button>
          </Box>

          <Box h='60px'>
            <Button type="submit">ユーザー情報更新</Button>
            
          </Box>
          <Box h='200px'> <hr/></Box>


        </Stack>
        </Center>
      </form>

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
            id={'../../article/edit/' + row.id} 
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

      <ScrollObserver
            onIntersect={fetchNextArticles}
            isActiveObserver={isActiveObserver}
          />
    </>

  );
};


export default Mypage;
