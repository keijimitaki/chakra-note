import { createContext, useState, useEffect } from 'react';

import {
  auth,
  onAuthStateChangedListener,
} from '../../utils/firebase';

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

//型定義
import User from '../../models/User'
type Props = {
  children: React.ReactNode;
};


export const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => null,
});

export const UserProvider = ({children}: Props) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const value: null | any = { currentUser, setCurrentUser };

  //初回読込み
  //ユーザー情報取得
  useEffect(() =>{

    (async ()=> {

        //現在ユーザーはこれを実施した後にしか取得できない
      onAuthStateChanged(auth, (authUser) => {

        if (authUser) {
          
          (async ()=> {

            const uid = authUser.uid;
            const db = getFirestore();
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const data = userSnap.data();
              
              let user = new User(uid, data.email, data.display_name,data.prof_image_url,data.created_at);
              setCurrentUser(user);
              console.log("user reset",user);

            } else {
              console.log("No such userSnap");
            }


          })();

        } else {
          // User is signed out
          console.log('onAuthStateChanged:','User is signed out');
        }

      });
  
    })();
    
  },[]);

  //変更検知リスナーの登録
  useEffect(() => {  
      const unsubscribe = onAuthStateChangedListener( (authUser: { uid: string; email: string; }) => {
        if (authUser) {
          console.log('変更検知');
        //   let user = new User(authUser.uid, authUser.email, null);
        //   setCurrentUser(user);
        }
        
      });
  
      return unsubscribe;

  }, []);
  
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>

}