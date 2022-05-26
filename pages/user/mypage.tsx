import React, { useRef, useState, useContext, useEffect } from 'react';

import '../../utils/firebase' // Initialize FirebaseApp
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";

import { collection, getDoc, getDocs, getFirestore, 
  doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp } from 'firebase/firestore'


import styles from './mypage.module.scss';
import User from '../../models/User'

// import Button from '../../components/crwn/button.component';
// import FormInput from '../../components/crwn/form-input.component';

// https://firebase.google.com/docs/auth/web/password-auth?hl=ja
// https://zenn.dev/rinda_1994/articles/482a4c5967c3c3
//https://fir-ui-demo-84a6c.firebaseapp.com/
import {
  auth,
  signInAuthUserWithEmailAndPassword,
  signInWithFacebookPopup,
  signInWithGooglePopup,
  createUserDocumentFromAuth,
  createAuthUserWithEmailAndPassword,
} from '../../utils/firebase';
import { Box, Button, Text, Container, FormControl, FormLabel, Grid, Input, Stack, StackDivider, VStack, RadioGroup, Radio } from '@chakra-ui/react';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

import { UserContext } from '../../store/contexts/user.context';
import Article from '../../components/Article';
import ImageUpLoad from '../../components/ImageUpLoad';

import { useRouter } from 'next/router';
const defaultFormFields = {
  displayName: '',
  password: '',
};


const Mypage = () => {

  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, password } = formFields;
  
  const storedUser = useContext(UserContext);
  const [myUid, setMyUid] = useState<string|null>(null); 

  const [userName ,setUserName] = useState('');
  const [emailVal ,setEmailVal] = useState('');

  const [image, setImage] = useState(null);
  const [imageUrl ,setImageUrl] = useState(null);

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
      const response = await signInAuthUserWithEmailAndPassword(
        emailVal,
        password
      );
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
    
    console.log('useEffect=>');

    //const f = async() => {

      //現在ユーザーはこれを実施した後にしか取得できない
      onAuthStateChanged(auth, (authUser) => {


        if (authUser) {
          const uid = authUser.uid;
          //@ts-ignore
          setMyUid(uid);

          // console.log('doc:',data);
          const f = async ()=> {

            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            
            const userSnap = await getDoc(userRef);
            console.log('userSnap:',userSnap);
              //@ts-ignore
            setEmailVal(authUser.email);

            if (userSnap.exists()) {
              const data = userSnap.data();
              
              const user:User = new User(uid, authUser.email, data.display_name, data.prof_image_url, data.created_at);

              console.log('userSnap:',data);
              //@ts-ignore
              setUserName(data.display_name);
              //@ts-ignore
              setImageUrl(data.prof_image_url);
              //@ts-ignore
              storedUser.setCurrentUser(user);

            } else {
              // doc.data() will be undefined in this case
              console.log("No such userSnap");
            }


            const storage = getStorage();
            const articlesQuery = query(collection(db, "articles"),where('author_uid', '==' ,uid), orderBy('created_at', 'desc'));
            const articlesSnapshot = await getDocs(articlesQuery);
            
            console.log('articlesSnapshot=>',articlesSnapshot);

            let rows = new Array();
            for await(let doc of articlesSnapshot.docs) {
            //articlesSnapshot.docs.forEach(
              // (doc) => {
      
                console.log(doc.id,doc);
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


                //   // @ts-ignore
                // getDownloadURL(ref(storage, `images/${doc.id}`))
                // .then((url) => {
      
                // }).catch((error) => {
                // });
      
                rows.push(row);
            
            
            };
            

              //});
      
            // @ts-ignore
            setArticles(rows);
            console.log('articles=',articles);
          
          };
          
          f();
            




        } else {
          // User is signed out
          console.log('onAuthStateChanged:','User is signed out');
          // ...
        }

      });
 
    //};

    //f();
    

  },[]);

  // 保存
  const submitHander = async (e:any)=> {
    e.preventDefault();

    const db = getFirestore();
    // const docRef = doc()

      //現在ユーザーはこれを実施した後にしか取得できない
      onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          const uid = authUser.uid;
     
          // console.log('doc:',data);
          (async ()=> {

            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            
            const userSnap = await getDoc(userRef);
            console.log('userSnap:',userSnap);

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

  
              //ユーザー情報更新
              const updateTimestamp = await updateDoc(userRef, {
                // @ts-ignore
                display_name: displayName,
                updated_at: serverTimestamp()
             });
  

            }         


            if (userSnap.exists()) {
              const data = userSnap.data();
              
              console.log('userSnap:',data);
              console.log(displayName);
              setUserName(displayName);

              const user = new User(uid, data.email, displayName, data.profImageUrl, data.createdAt);
              setImageUrl(data.profImageUrl);

              console.log('userSnap:',data);
              console.log(data.displayName);
              setUserName(data.displayName);
              //@ts-ignore
              storedUser.setCurrentUser(user);
  
            } else {
              // doc.data() will be undefined in this case
              console.log("No such userSnap");
            }


          })();

        } else {
          // User is signed out
          console.log('onAuthStateChanged:','User is signed out');
          // ...
        }

      });
     

  }


  const [articles, setArticles] = useState([]);




  return (
    <div>

      <form onSubmit={submitHander}>
        
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
          <div className={styles['grid']}>

            {(articles.length>0) && articles.map((row: any) => (

              <Article 
                key={row.id} 
                id={'../../article/edit/' + row.id} 
                title={row.title} 
                content={row.content} 
                orgUrl={row.orgUrl} 
                favCount={row.favCount}
                favedUid={myUid}
                tags={row.tags}
                />

            ))}

          </div>

        </Stack>

      </form>

    </div>
  );
};


export default Mypage;
