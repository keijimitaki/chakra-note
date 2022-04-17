import { initializeApp } from 'firebase/app'
import { 
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  signInWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
 } from 'firebase/auth'


// facebook
// https://firebase.google.com/docs/auth/web/facebook-login
// https://www.youtube.com/watch?v=kEfe9u5F_L0

import { getStorage, ref } from 'firebase/storage'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

initializeApp({
  apiKey: "AIzaSyCdkRZRfGOW4dsSbmsgC2QKMcGd1uEHx4Q",
  authDomain: "chakra-note.firebaseapp.com",
  projectId: "chakra-note",
  storageBucket: "chakra-note.appspot.com",
  messagingSenderId: "600150538454",
  appId: "1:600150538454:web:695a2382a72da6ec61b177"
})

const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
  prompt: "選択してください　よ"
});

export const auth = getAuth();

/*
export const signInWithFacebookPopup = async() => {
  const provider = new FacebookAuthProvider();
  console.log('FB start',provider);

  await signInWithPopup(auth, provider)
  .then((result)=>{
    const user = result.user;
    console.log(result);

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    // @ts-ignore
    const accessToken = credential.accessToken;

  })
  .catch((err)=>{
    console.log(err.message);
  })

  console.log('FB end');

}
*/

const fbProvider = new FacebookAuthProvider();
export const signInWithFacebookPopup = () =>  signInWithPopup(auth, fbProvider);

export const signInWithGooglePopup = () =>  signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () =>  signInWithRedirect(auth, googleProvider);

export const db = getFirestore();

export const createUserDocumentFromAuth = async (
    // @ts-ignore
    userAuth,
  additionalInformation = {}
) => {

  if (!userAuth) return;

  const userDocRef = doc(db, 'users', userAuth.uid);

  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await setDoc(userDocRef, {
        uid: userAuth.uid,
        email: email,
        display_name: displayName,
        prof_image_url: null,
        premium_user_flag: null,
        premium_join_at: null,
        premium_leave_at: null,
        created_at: createdAt,
        updated_at: null,
        ...additionalInformation,
      });

    } catch (error) {
    // @ts-ignore
    console.log('error creating the user', error.message);
    }
  }

  return userDocRef;
};

// @ts-ignore
export const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

    // @ts-ignore
    return await createUserWithEmailAndPassword(auth, email, password);
};

// @ts-ignore
export const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

   // @ts-ignore
  return await signInWithEmailAndPassword(auth, email, password);
};

// @ts-ignore
export const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, callback);
};